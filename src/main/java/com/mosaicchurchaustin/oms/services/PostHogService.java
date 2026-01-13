package com.mosaicchurchaustin.oms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.TimingType;
import com.mosaicchurchaustin.oms.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostHogService {

    @Value("${posthog.api.key:}")
    private final String postHogApiKey;

    @Value("${posthog.api.projectId:}")
    private final String postHogProjectId;

    private static final String POSTHOG_API_HOST = "us.posthog.com";

    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();



    /**
     * Fetches historical data for entire duration range in a single API call
     * Returns a Map of week start dates to average timing values for that week
     */
    public java.util.Map<LocalDate, Double> getBulkWeeklyDataForTimingType(final TimingType timingType, final LocalDate startDate) {
        final var endDate = LocalDate.now();
        log.info("PostHog INPUT: Fetching bulk {} data from {} to {}", timingType, startDate, endDate);
        
        final String insightId = getInsightIdForTimingType(timingType);
        final String response = fetchInsightWithDateRange(insightId, startDate, endDate);
        final java.util.Map<LocalDate, Double> weeklyData = parseWeeklyInsightResponse(response, timingType);
        
        log.info("PostHog OUTPUT: Parsed {} weeks of {} data with dates: {}",
            weeklyData.size(), timingType, weeklyData.keySet());
        return weeklyData;
    }

    /**
     * Parses PostHog insight response to extract weekly data points
     * PostHog insights are configured to return weekly data grouped by week start date
     */
    private java.util.Map<LocalDate, Double> parseWeeklyInsightResponse(final String response, final TimingType timingType) {
        final java.util.Map<LocalDate, Double> weeklyData = new java.util.LinkedHashMap<>();
        
        try {
            final JsonNode root = objectMapper.readTree(response);
            final JsonNode result = root.get("results");
            
            if (result != null && result.isArray() && !result.isEmpty()) {
                final JsonNode firstResult = result.get(0);
                final JsonNode data = firstResult.get("data");
                final JsonNode days = firstResult.get("days");
                
                if (data != null && data.isArray() && days != null && days.isArray() && 
                    data.size() == days.size()) {
                    
                    // PostHog returns parallel arrays of dates and values
                    for (int i = 0; i < data.size(); i++) {
                        final JsonNode dataPoint = data.get(i);
                        final JsonNode dayNode = days.get(i);
                        
                        if (dataPoint.isNumber() && dayNode.isTextual()) {
                            Double value = dataPoint.asDouble();
                            final String dateString = dayNode.asText();
                            
                            try {
                                final LocalDate date = LocalDate.parse(dateString);
                                
                                // Convert milliseconds to seconds for order taker time
                                if (value != null && timingType == TimingType.ORDER_TAKER_TIME) {
                                    value = value / 1000.0;
                                }
                                
                                if (value != null && value > 0) {
                                    weeklyData.put(date, value);
                                }
                                
                            } catch (final Exception e) {
                                log.warn("Failed to parse date '{}' from PostHog response: {}", dateString, e.getMessage());
                            }
                        }
                    }
                }
            }
            
            log.info("Parsed {} data points from PostHog response", weeklyData.size());
            return weeklyData;
            
        } catch (final Exception e) {
            log.error("Failed to parse PostHog insight response", e);
            return weeklyData; // Return empty map
        }
    }

    private String getInsightIdForTimingType(final TimingType timingType) {
        return switch (timingType) {
            case ORDER_TAKER_TIME -> "2794475";
            case FULFILLMENT_TIME -> "2802550";
        };
    }

    private String fetchInsightWithDateRange(final String insightId, final LocalDate startDate, final LocalDate endDate) {
        if (postHogApiKey == null || postHogApiKey.isEmpty()) {
            log.warn("PostHog API key not configured");
            throw new RuntimeException("PostHog API key not configured");
        }

        // Use PostHog's query API instead of insights API for full date range control
        final String queryBody = buildPostHogQueryForTimingType(insightId, startDate, endDate);

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host(POSTHOG_API_HOST)
                    .path("/api/projects/{project_id}/query/")
                    .build(postHogProjectId))
                .header("Authorization", "Bearer " + postHogApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(queryBody)
                .retrieve()
                .onStatus(
                    status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> response.bodyToMono(String.class)
                        .map(body -> {
                            log.error("PostHog query API failed for insight {} date range {} to {}. Status: {}, Response: {}", 
                                insightId, startDate, endDate, response.statusCode(), body);
                            return new RuntimeException("PostHog API error: " + response.statusCode() + " - " + body);
                        })
                )
                .bodyToMono(String.class)
                .doOnError(error -> log.error("PostHog query API call failed for insight {} date range {} to {}: {}", 
                    insightId, startDate, endDate, error.getMessage()))
                .block();
    }

    private String buildPostHogQueryForTimingType(final String insightId, final LocalDate startDate, final LocalDate endDate) {
        // Map insight IDs to their corresponding events and properties
        final String eventName;
        final String propertyName;
        
        switch (insightId) {
            case "2794475": // ORDER_TAKER_TIME
                eventName = "order_funnel_completed";
                propertyName = "timeToCompleteMs";
                break;
            case "2802550": // FULFILLMENT_TIME
                eventName = "order_fulfillment_completed";
                propertyName = "timeToFillSeconds";
                break;
            default:
                throw new IllegalArgumentException("Unknown insight ID: " + insightId);
        }

        // Build PostHog query JSON based on the SQL from the insights
        return String.format("""
            {
              "query": {
                "kind": "TrendsQuery",
                "series": [
                  {
                    "kind": "EventsNode",
                    "event": "%s",
                    "math": "avg",
                    "math_property": "%s"
                  }
                ],
                "interval": "week",
                "dateRange": {
                  "date_from": "%s",
                  "date_to": "%s",
                  "explicitDate": true
                },
                "filterTestAccounts": true
              }
            }
            """, eventName, propertyName, startDate.toString(), endDate.toString());
    }

    /**
     * Gets the start of a specific date's week (Sunday)
     * @deprecated Use DateUtils.getSundayStartForDate() instead
     */
    @Deprecated
    public static LocalDate getSundayStartForDate(final LocalDate date) {
        return DateUtils.getSundayStartForDate(date);
    }

    private String getProjectId() {
        return postHogProjectId;
    }
}
