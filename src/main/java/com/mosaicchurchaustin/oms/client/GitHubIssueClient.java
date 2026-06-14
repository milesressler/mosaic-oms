package com.mosaicchurchaustin.oms.client;

import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;

@Slf4j
@Component
public class GitHubIssueClient {

    // Hidden marker so the GitHub Actions workflow can identify OMS-originated issues
    private static final String OMS_MARKER = "<!-- mosaic-oms-bug-report -->";
    private static final String GITHUB_API_BASE = "https://api.github.com/repos/%s/issues";

    @Value("${github.api.token:}")
    private String apiToken;

    @Value("${github.repo:milesressler/mosaic-oms}")
    private String repo;

    @Value("${github.auto-issue.enabled:false}")
    private boolean autoIssueEnabled;

    private final OkHttpClient client = new OkHttpClient();

    public void createBugReportIssue(final String title, final String description, final String reporterName, final String adminUrl) {
        if (!autoIssueEnabled) {
            log.debug("GitHub auto-issue creation is disabled, skipping.");
            return;
        }
        if (!StringUtils.hasText(apiToken)) {
            log.warn("GitHub auto-issue is enabled but github.api.token is not configured.");
            return;
        }

        final String body = buildIssueBody(reporterName, description, adminUrl);
        final String json = String.format(
                "{\"title\": \"%s\", \"body\": \"%s\"}",
                escapeJson(title),
                escapeJson(body)
        );

        final String url = String.format(GITHUB_API_BASE, repo);
        final RequestBody requestBody = RequestBody.create(json, MediaType.get("application/json; charset=utf-8"));
        final Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + apiToken)
                .addHeader("Accept", "application/vnd.github+json")
                .addHeader("X-GitHub-Api-Version", "2022-11-28")
                .post(requestBody)
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                log.info("GitHub issue created for bug report: {}", title);
            } else {
                final String responseBody = response.body() != null ? response.body().string() : "<empty body>";
                log.error("Failed to create GitHub issue. Response code: {}, body: {}", response.code(), responseBody);
            }
        } catch (final IOException e) {
            log.error("IOException creating GitHub issue for bug report", e);
        } catch (final Exception e) {
            log.error("Unexpected exception creating GitHub issue for bug report", e);
        }
    }

    private String buildIssueBody(final String reporterName, final String description, final String adminUrl) {
        return OMS_MARKER + "\n\n"
                + "**Reported by:** " + reporterName + "\n\n"
                + "**Description:**\n" + (description != null ? description : "_No description provided._") + "\n\n"
                + "---\n"
                + "_Auto-created from [Mosaic OMS Bug Reports](" + adminUrl + ")_";
    }

    private String escapeJson(final String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
