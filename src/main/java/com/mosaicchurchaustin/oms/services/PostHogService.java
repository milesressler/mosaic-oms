package com.mosaicchurchaustin.oms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mosaicchurchaustin.oms.data.entity.TimingType;
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


    private Double parseInsightValue(final String response) {
        try {
            final JsonNode root = objectMapper.readTree(response);
            final JsonNode result = root.get("result");
            
            if (result != null && result.isArray() && !result.isEmpty()) {
                // Most insights return an array with aggregated values
                final JsonNode firstResult = result.get(0);
                final JsonNode data = firstResult.get("data");
                
                if (data != null && data.isArray() && !data.isEmpty()) {
                    // Get the latest/most recent value from the data points
                    final JsonNode lastDataPoint = data.get(data.size() - 1);
                    if (lastDataPoint.isNumber()) {
                        final double value = lastDataPoint.asDouble();
                        log.info("Parsed insight value: {}", value);
                        return value;
                    }
                }
                
                // Alternative structure: direct aggregation value
                if (firstResult.has("aggregated_value")) {
                    final JsonNode aggregatedValue = firstResult.get("aggregated_value");
                    if (aggregatedValue.isNumber()) {
                        final double value = aggregatedValue.asDouble();
                        log.info("Parsed aggregated insight value: {}", value);
                        return value;
                    }
                }
            }
            
            log.warn("No valid insight data found in PostHog response");
            return null;
            
        } catch (final Exception e) {
            log.error("Failed to parse PostHog insight response", e);
            return null;
        }
    }

    /**
     * Fetches historical data for entire duration range in a single API call
     * Returns a Map of week start dates to average timing values for that week
     */
    public java.util.Map<LocalDate, Double> getBulkWeeklyDataForTimingType(final TimingType timingType, final LocalDate startDate, final LocalDate endDate) {
        log.info("Fetching bulk {} data from {} to {}", timingType, startDate, endDate);
        
        final String insightId = getInsightIdForTimingType(timingType);
        final String response = fetchInsightWithDateRange(insightId, startDate, endDate);
        final java.util.Map<LocalDate, Double> weeklyData = parseWeeklyInsightResponse(response, timingType);
        
        log.info("Parsed {} weeks of {} data", weeklyData.size(), timingType);
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
            final JsonNode result = root.get("result");
            
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

        // Calculate days ago from today for PostHog relative date format
        final LocalDate today = LocalDate.now();
        final long daysFromStart = java.time.temporal.ChronoUnit.DAYS.between(startDate, today);
        final long daysFromEnd = java.time.temporal.ChronoUnit.DAYS.between(endDate, today);
        
        // PostHog expects relative dates like "-7d" for 7 days ago, null for "today"
        final String dateFrom = daysFromStart > 0 ? "-" + daysFromStart + "d" : "0d";
        final String dateTo = daysFromEnd > 0 ? "-" + daysFromEnd + "d" : null;

        return webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                        .scheme("https")
                        .host(POSTHOG_API_HOST)
                        .path("/api/projects/{project_id}/insights/{insight_id}/")
                        .queryParam("date_from", dateFrom)
                        .queryParam("explicitDate", false);
                    
                    // Only add date_to if it's not null (null means "today")
                    if (dateTo != null) {
                        builder.queryParam("date_to", dateTo);
                    }
                    
                    return builder.build(getProjectId(), insightId);
                })
                .header("Authorization", "Bearer " + postHogApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .doOnError(error -> log.error("PostHog insight API call failed for insight {} with relative dates from {} ({}) to {} ({}): {}", 
                    insightId, startDate, dateFrom, endDate, dateTo, error.getMessage()))
                .block();
    }

    /**
     * Gets the start of a specific date's week (Sunday)
     */
    public static LocalDate getSundayStartForDate(final LocalDate date) {
        final int daysFromSunday = date.getDayOfWeek().getValue() % 7;
        return date.minusDays(daysFromSunday);
    }

    private String getProjectId() {
        return postHogProjectId;
    }
}
