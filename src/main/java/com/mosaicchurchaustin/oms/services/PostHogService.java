package com.mosaicchurchaustin.oms.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostHogService {

    @Value("${posthog.api.key:}")
    private String postHogApiKey;

    @Value("${posthog.api.projectId:}")
    private String postHogProjectId;

    private String POSTHOG_API_HOST = "us.posthog.com";

    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetches weekly average for order funnel completion time from PostHog.
     * Caches result for 6 hours to avoid repeated API calls.
     */
    @Cacheable(value = "postHogOrderTiming", key = "'orderFunnelAvg'")
    public Double getOrderTakerTimeAverage() {
        log.info("Fetching order taker time average from PostHog insight");
        
        // Use the pre-built order taker insight
        String insightId = "2794475";
        String response = fetchInsightFromPostHog(insightId);
        Double milliseconds = parseInsightValue(response);
        
        if (milliseconds != null) {
            // Convert milliseconds to seconds
            return milliseconds / (1000.0);
        }
        return null;
    }

    /**
     * Fetches weekly average for order fulfillment time from PostHog.
     * Caches result for 6 hours to avoid repeated API calls.
     */
    @Cacheable(value = "postHogFulfillmentTiming", key = "'orderFulfillmentAvg'")
    public Double getItemCollectionTimeAverage() {
        log.info("Fetching item collection time average from PostHog insight");
        
        // Use the pre-built fulfillment time insight
        String insightId = "2802550";
        String response = fetchInsightFromPostHog(insightId);
        Double seconds = parseInsightValue(response);
        
        if (seconds != null) {
            // Convert seconds to seconds
            return seconds;
        }
        return null;
    }

    private String fetchInsightFromPostHog(String insightId) {
        if (postHogApiKey == null || postHogApiKey.isEmpty()) {
            log.warn("PostHog API key not configured");
            throw new RuntimeException("PostHog API key not configured");
        }

        // Use PostHog insights API to fetch specific insight by ID
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host(POSTHOG_API_HOST)
                    .path("/api/projects/{project_id}/insights/{insight_id}/")
                    .build(getProjectId(), insightId))
                .header("Authorization", "Bearer " + postHogApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .doOnError(error -> log.error("PostHog insight API call failed for insight {}: {}", insightId, error.getMessage()))
                .block();
    }

    private Double  parseInsightValue(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode result = root.get("result");
            
            if (result != null && result.isArray() && !result.isEmpty()) {
                // Most insights return an array with aggregated values
                JsonNode firstResult = result.get(0);
                JsonNode data = firstResult.get("data");
                
                if (data != null && data.isArray() && !data.isEmpty()) {
                    // Get the latest/most recent value from the data points
                    JsonNode lastDataPoint = data.get(data.size() - 1);
                    if (lastDataPoint.isNumber()) {
                        double value = lastDataPoint.asDouble();
                        log.info("Parsed insight value: {}", value);
                        return value;
                    }
                }
                
                // Alternative structure: direct aggregation value
                if (firstResult.has("aggregated_value")) {
                    JsonNode aggregatedValue = firstResult.get("aggregated_value");
                    if (aggregatedValue.isNumber()) {
                        double value = aggregatedValue.asDouble();
                        log.info("Parsed aggregated insight value: {}", value);
                        return value;
                    }
                }
            }
            
            log.warn("No valid insight data found in PostHog response");
            return null;
            
        } catch (Exception e) {
            log.error("Failed to parse PostHog insight response", e);
            return null;
        }
    }

    private String getProjectId() {
        return postHogProjectId;
    }
}
