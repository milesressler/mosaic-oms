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
public class SlackWebhookClient {

    @Value("${slack.webhook.bugs:}")
    private String bugsWebhookUrl;

    private final OkHttpClient client = new OkHttpClient();

    public void postBugReport(final String reporterName, final String title, final String description, final String adminUrl) {
        if (!StringUtils.hasText(bugsWebhookUrl)) {
            log.debug("Slack bugs webhook not configured, skipping notification.");
            return;
        }

        final String json = String.format("""
                {
                  "blocks": [
                    {
                      "type": "header",
                      "text": { "type": "plain_text", "text": ":bug: New Bug Report", "emoji": true }
                    },
                    {
                      "type": "section",
                      "fields": [
                        { "type": "mrkdwn", "text": "*Reported by:*\\n%s" },
                        { "type": "mrkdwn", "text": "*Title:*\\n%s" }
                      ]
                    },
                    {
                      "type": "section",
                      "text": { "type": "mrkdwn", "text": "*Description:*\\n%s" }
                    },
                    {
                      "type": "actions",
                      "elements": [
                        {
                          "type": "button",
                          "text": { "type": "plain_text", "text": "View Bug Reports" },
                          "url": "%s"
                        }
                      ]
                    }
                  ]
                }
                """,
                escapeJson(reporterName),
                escapeJson(title),
                escapeJson(description != null ? description : ""),
                adminUrl);

        final RequestBody body = RequestBody.create(json, MediaType.get("application/json; charset=utf-8"));
        final Request request = new Request.Builder()
                .url(bugsWebhookUrl)
                .post(body)
                .build();

        try (final Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                log.debug("Bug report notification posted to Slack.");
            } else {
                final String responseBody = response.body() != null ? response.body().string() : "<empty body>";
                log.error("Failed to post bug report to Slack. Response code: {}, body: {}", response.code(), responseBody);
            }
        } catch (final IOException e) {
            log.error("IOException posting bug report to Slack", e);
        } catch (final Exception e) {
            log.error("Unexpected exception posting bug report to Slack", e);
        }
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
