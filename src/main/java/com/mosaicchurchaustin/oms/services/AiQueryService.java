package com.mosaicchurchaustin.oms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mosaicchurchaustin.oms.data.entity.AiQueryLogEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.request.AiQueryRequest;
import com.mosaicchurchaustin.oms.data.response.AiQueryResponse;
import com.mosaicchurchaustin.oms.repositories.AiQueryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import org.springframework.beans.factory.annotation.Qualifier;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiQueryService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final int MAX_ROWS = 200;
    private static final int MAX_ITERATIONS = 8;

    private final OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .callTimeout(120, TimeUnit.SECONDS)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = buildSystemPrompt();

    private static String buildSystemPrompt() {
        final StringBuilder sb = new StringBuilder("""
                You are a data analyst assistant for a church street ministry order management system.
                You have access to a tool called execute_sql that runs read-only SELECT queries against the MySQL database.

                Use the tool to explore the data and answer the user's question accurately.
                If you're unsure of exact values (like item names), run an exploratory query first.

                AVAILABLE VIEWS (these are the only objects you can query):
                """);

        for (final AiViewSchema view : AiViewSchema.values()) {
            sb.append("\nVIEW: ").append(view.getViewName())
              .append("  -- ").append(view.getPurpose()).append("\n");
            for (final AiViewSchema.Column col : view.getColumns()) {
                sb.append("  ").append(col.name())
                  .append(" ").append(col.type())
                  .append(" -- ").append(col.description())
                  .append("\n");
            }
        }

        sb.append("""

                RULES:
                - Only query the views listed above — no other tables or objects exist
                - Only SELECT statements are allowed
                - Use LIMIT when exploring data (20-50 rows is usually enough)
                - Add LIMIT %d to any query that could return many rows
                - Dates are UTC; use DATE() for date comparisons, NOW() for current time
                - When looking up item names, use LIKE with %%%% for partial matching
                - Provide a clear, concise answer once you have enough data
                """.formatted(MAX_ROWS));

        return sb.toString();
    }

    private final AiQueryLogRepository aiQueryLogRepository;

    @Qualifier("readOnlyJdbcTemplate")
    private final JdbcTemplate jdbcTemplate;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    public AiQueryResponse processQuery(final String question,
                                        final List<AiQueryRequest.ConversationTurn> history,
                                        final UserEntity user) {
        final List<String> sqlQueriesRun = new ArrayList<>();
        String errorMessage = null;
        String answer = null;

        try {
            answer = runAgenticLoop(question, history, sqlQueriesRun);
        } catch (final Exception e) {
            errorMessage = e.getMessage();
            throw new RuntimeException("Query failed: " + e.getMessage(), e);
        } finally {
            String sqlLog = null;
            try {
                if (!sqlQueriesRun.isEmpty()) {
                    sqlLog = objectMapper.writeValueAsString(sqlQueriesRun);
                }
            } catch (final Exception ignored) {}
            aiQueryLogRepository.save(AiQueryLogEntity.builder()
                    .user(user)
                    .question(question)
                    .generatedSql(sqlLog)
                    .resultRowCount(sqlQueriesRun.size())
                    .errorMessage(errorMessage)
                    .build());
        }

        return AiQueryResponse.builder().answer(answer).build();
    }

    private String runAgenticLoop(final String question,
                                  final List<AiQueryRequest.ConversationTurn> history,
                                  final List<String> sqlQueriesRun) throws Exception {
        final ArrayNode messages = objectMapper.createArrayNode();

        if (history != null) {
            for (final AiQueryRequest.ConversationTurn turn : history) {
                final ObjectNode prevUser = messages.addObject();
                prevUser.put("role", "user");
                prevUser.put("content", turn.getQuestion());
                final ObjectNode prevAssistant = messages.addObject();
                prevAssistant.put("role", "assistant");
                prevAssistant.put("content", turn.getAnswer());
            }
        }

        final ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", question);

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            final JsonNode response = callAnthropic(messages);
            final String stopReason = response.path("stop_reason").asText();
            final JsonNode content = response.path("content");

            final ObjectNode assistantMsg = messages.addObject();
            assistantMsg.put("role", "assistant");
            assistantMsg.set("content", content);

            if ("end_turn".equals(stopReason)) {
                for (final JsonNode block : content) {
                    if ("text".equals(block.path("type").asText())) {
                        return block.path("text").asText();
                    }
                }
                return "No answer was provided.";
            }

            if ("tool_use".equals(stopReason)) {
                final ObjectNode toolResultMsg = messages.addObject();
                toolResultMsg.put("role", "user");
                final ArrayNode toolResults = toolResultMsg.putArray("content");

                for (final JsonNode block : content) {
                    if ("tool_use".equals(block.path("type").asText())) {
                        final String toolUseId = block.path("id").asText();
                        final String sql = block.path("input").path("sql").asText();
                        sqlQueriesRun.add(sql);
                        log.debug("AI executing SQL: {}", sql);

                        final ObjectNode toolResult = toolResults.addObject();
                        toolResult.put("type", "tool_result");
                        toolResult.put("tool_use_id", toolUseId);
                        toolResult.put("content", executeSafeQuery(sql));
                    }
                }
            }
        }

        throw new RuntimeException("Could not complete analysis within the allowed number of queries.");
    }

    private String executeSafeQuery(final String sql) {
        try {
            validateSql(sql);
            final List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            return formatResultForClaude(results);
        } catch (final Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String formatResultForClaude(final List<Map<String, Object>> results) {
        if (results.isEmpty()) {
            return "(no rows returned)";
        }
        final List<String> columns = new ArrayList<>(results.get(0).keySet());
        final StringBuilder sb = new StringBuilder();
        sb.append(String.join(" | ", columns)).append("\n");
        sb.append("-".repeat(Math.min(columns.size() * 15, 100))).append("\n");
        for (final Map<String, Object> row : results) {
            sb.append(columns.stream()
                    .map(col -> row.get(col) == null ? "NULL" : String.valueOf(row.get(col)))
                    .collect(Collectors.joining(" | ")))
              .append("\n");
        }
        sb.append("(").append(results.size()).append(" rows)");
        return sb.toString();
    }

    private JsonNode callAnthropic(final ArrayNode messages) throws Exception {
        final ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", MODEL);
        requestBody.put("max_tokens", 2048);
        requestBody.put("system", SYSTEM_PROMPT);
        requestBody.set("tools", buildToolDefinition());
        requestBody.set("messages", messages);

        final String requestJson = objectMapper.writeValueAsString(requestBody);
        final Request request = new Request.Builder()
                .url(ANTHROPIC_API_URL)
                .addHeader("x-api-key", anthropicApiKey)
                .addHeader("anthropic-version", "2023-06-01")
                .addHeader("content-type", "application/json")
                .post(RequestBody.create(requestJson, MediaType.get("application/json")))
                .build();

        try (final Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.error("Anthropic API error {}: {}", response.code(), response.body().string());
                throw new RuntimeException("Anthropic API error: " + response.code());
            }
            return objectMapper.readTree(response.body().string());
        }
    }

    private ArrayNode buildToolDefinition() {
        final ArrayNode tools = objectMapper.createArrayNode();
        final ObjectNode tool = tools.addObject();
        tool.put("name", "execute_sql");
        tool.put("description", "Execute a read-only MySQL SELECT query against the database. Returns results as a text table. Use this to explore data and find the answer to the user's question.");
        final ObjectNode inputSchema = tool.putObject("input_schema");
        inputSchema.put("type", "object");
        final ObjectNode properties = inputSchema.putObject("properties");
        final ObjectNode sqlProp = properties.putObject("sql");
        sqlProp.put("type", "string");
        sqlProp.put("description", "A valid MySQL SELECT query");
        inputSchema.putArray("required").add("sql");
        return tools;
    }

    private void validateSql(final String sql) {
        final String upper = sql.toUpperCase().replaceAll("--[^\n]*", "").replaceAll("/\\*.*?\\*/", "").trim();
        if (!upper.startsWith("SELECT")) {
            throw new IllegalArgumentException("Only SELECT queries are allowed.");
        }
        final String[] blocked = {"INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE"};
        for (final String keyword : blocked) {
            if (Pattern.compile("\\b" + keyword + "\\b").matcher(upper).find()) {
                throw new IllegalArgumentException("Query contains disallowed keyword: " + keyword);
            }
        }
    }
}
