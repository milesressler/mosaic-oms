package com.mosaicchurchaustin.oms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mosaicchurchaustin.oms.data.entity.AiQueryLogEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.response.AiQueryResponse;
import com.mosaicchurchaustin.oms.repositories.AiQueryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiQueryService {

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";
    private static final int MAX_ROWS = 500;
    private static final Pattern SQL_CODE_BLOCK = Pattern.compile("```(?:sql)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
    private final OkHttpClient okHttpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SCHEMA_CONTEXT = """
            You are a SQL query generator for a church street ministry order management system.
            Generate a single, read-only MySQL SELECT query based on the user's question.

            DATABASE SCHEMA:

            TABLE: orders
              id BIGINT, uuid VARCHAR, created DATETIME, updated DATETIME,
              order_status VARCHAR -- values: PENDING_ACCEPTANCE, IN_PROGRESS, READY, COMPLETED, CANCELLED,
              customer_id BIGINT (FK -> customers.id),
              assignee BIGINT NULL (FK -> users.id) -- the staff member assigned to this order,
              special_instructions VARCHAR NULL,
              cart_id VARCHAR NULL

            TABLE: customers
              id BIGINT, uuid VARCHAR, created DATETIME, updated DATETIME,
              first_name VARCHAR, last_name VARCHAR,
              flagged BIT -- 1 if flagged for staff attention,
              exclude_from_metrics BOOLEAN -- 1 if excluded from reporting

            TABLE: order_items
              id BIGINT, created DATETIME,
              order_entity_id BIGINT (FK -> orders.id),
              item_entity_id BIGINT (FK -> items.id),
              quantity INT, quantity_fulfilled INT NULL,
              notes VARCHAR NULL,
              attributes JSON NULL

            TABLE: items
              id BIGINT, description VARCHAR,
              category VARCHAR NULL,
              availability VARCHAR -- values: AVAILABLE, UNAVAILABLE,
              managed TINYINT -- 1 if managed/tracked by staff

            TABLE: order_history
              id BIGINT, timestamp DATETIME,
              order_entity_id BIGINT (FK -> orders.id),
              user_entity_id BIGINT (FK -> users.id),
              type VARCHAR -- e.g. STATUS_CHANGE,
              order_status VARCHAR,
              comment VARCHAR NULL

            TABLE: shower_reservations
              id BIGINT, created DATETIME, updated DATETIME,
              customer_id BIGINT (FK -> customers.id),
              created_by BIGINT NULL (FK -> users.id),
              started_at DATETIME NULL, ended_at DATETIME NULL,
              reservation_status VARCHAR -- e.g. WAITING, IN_PROGRESS, COMPLETED, CANCELLED,
              queue_position BIGINT,
              notes TEXT NULL,
              shower_number INT NULL

            TABLE: users
              id BIGINT, uuid VARCHAR, name VARCHAR, username VARCHAR, created DATETIME

            VIEW: daily_order_counts
              date DATE, order_count INT -- total orders created each day

            VIEW: weekly_item_requests_with_names
              week_start DATE, item_entity_id BIGINT, item_name VARCHAR, request_count INT

            TABLE: process_timing_analytics
              week_start_date DATE,
              timing_type VARCHAR -- values: ORDER_TAKER_TIME, FULFILLMENT_TIME,
              avg_time_seconds DOUBLE

            RULES:
            - Return ONLY the raw SQL query with no explanation, markdown, or commentary
            - Use only SELECT statements - no INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or TRUNCATE
            - Always add LIMIT %d at the end unless the query already has a limit
            - All dates/times are stored in UTC
            - Use table aliases for readability when joining multiple tables
            """.formatted(MAX_ROWS);

    private final AiQueryLogRepository aiQueryLogRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    public AiQueryResponse processQuery(final String question, final UserEntity user) {
        String generatedSql = null;
        String errorMessage = null;
        AiQueryResponse response = null;

        try {
            generatedSql = generateSql(question);
            validateSql(generatedSql);
            response = executeQuery(generatedSql);
        } catch (final Exception e) {
            errorMessage = e.getMessage();
            throw new RuntimeException("Query failed: " + e.getMessage(), e);
        } finally {
            final Integer rowCount = response != null ? response.getRowCount() : null;
            aiQueryLogRepository.save(AiQueryLogEntity.builder()
                    .user(user)
                    .question(question)
                    .generatedSql(generatedSql)
                    .resultRowCount(rowCount)
                    .errorMessage(errorMessage)
                    .build());
        }

        return response;
    }

    private String generateSql(final String question) throws Exception {
        final ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", MODEL);
        requestBody.put("max_tokens", 1024);

        final ArrayNode messages = requestBody.putArray("messages");
        final ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", SCHEMA_CONTEXT + "\n\nQuestion: " + question);

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
               log.error("Request failed: " + response.body().string());
                throw new RuntimeException("Anthropic API error: " + response.code());
            }
            final String responseBody = response.body().string();
            final JsonNode responseNode = objectMapper.readTree(responseBody);
            final String rawContent = responseNode.path("content").get(0).path("text").asText();
            return extractSql(rawContent);
        }
    }

    private String extractSql(final String rawContent) {
        final Matcher matcher = SQL_CODE_BLOCK.matcher(rawContent);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return rawContent.trim();
    }

    private void validateSql(final String sql) {
        final String upper = sql.toUpperCase().replaceAll("--[^\n]*", "").replaceAll("/\\*.*?\\*/", "").trim();
        if (!upper.startsWith("SELECT")) {
            throw new IllegalArgumentException("Only SELECT queries are allowed.");
        }
        final String[] blocked = {"INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE"};
        for (final String keyword : blocked) {
            if (upper.contains(keyword)) {
                throw new IllegalArgumentException("Query contains disallowed keyword: " + keyword);
            }
        }
    }

    private AiQueryResponse executeQuery(final String sql) {
        final List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);

        if (results.isEmpty()) {
            return AiQueryResponse.builder()
                    .columns(List.of())
                    .rows(List.of())
                    .rowCount(0)
                    .build();
        }

        final List<String> columns = new ArrayList<>(results.get(0).keySet());
        final List<List<Object>> rows = new ArrayList<>();
        for (final Map<String, Object> row : results) {
            final List<Object> rowValues = new ArrayList<>();
            for (final String column : columns) {
                rowValues.add(row.get(column));
            }
            rows.add(rowValues);
        }

        return AiQueryResponse.builder()
                .columns(columns)
                .rows(rows)
                .rowCount(rows.size())
                .build();
    }
}
