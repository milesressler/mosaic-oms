package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.ProcessTimingAnalyticsEntity;
import com.mosaicchurchaustin.oms.data.entity.TimingType;
import com.mosaicchurchaustin.oms.repositories.ProcessTimingAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsSyncService {

    private final ProcessTimingAnalyticsRepository analyticsRepository;
    private final PostHogService postHogService;
    
    private static final LocalDate MIN_START_DATE = LocalDate.of(2025, 5, 25);

    /**
     * Sync analytics data every 15 minutes
     * Fetches data from the last completed date to present
     */
    @Scheduled(fixedDelay = 900000) // 15 minutes
    public void syncAnalyticsData() {
        log.info("Starting scheduled analytics sync");
        
        try {
            // Process both timing types
            syncTimingType(TimingType.ORDER_TAKER_TIME);
            syncTimingType(TimingType.FULFILLMENT_TIME);
            
            log.info("Completed scheduled analytics sync");
        } catch (Exception e) {
            log.error("Failed to sync analytics data", e);
        }
    }

    private void syncTimingType(TimingType timingType) {
        try {
            // Find the most recent date we have data for this timing type
            final Optional<LocalDate> latestDateOpt = analyticsRepository.findLatestWeekStartDateByTimingType(timingType);
            
            LocalDate startDate;
            if (latestDateOpt.isEmpty()) {
                // No data exists, start from max(MIN_START_DATE, today minus one year)
                final LocalDate oneYearAgo = PostHogService.getSundayStartForDate(LocalDate.now().minusYears(1));
                startDate = MIN_START_DATE.isAfter(oneYearAgo) ? MIN_START_DATE : oneYearAgo;
            } else {
                // Have data, start from last completed date minus one week
                startDate = latestDateOpt.get().minusWeeks(1);
            }
            
            // Always use Sunday as reference point
            startDate = PostHogService.getSundayStartForDate(startDate);
            final LocalDate endDate = PostHogService.getSundayStartForDate(LocalDate.now());
            
            log.info("Fetching {} data from {} to {}", timingType, startDate, endDate);
            
            // Make API call to PostHog for this timing type
            java.util.Map<LocalDate, Double> weeklyData = 
                postHogService.getBulkWeeklyDataForTimingType(timingType, startDate, endDate);

            weeklyData.forEach((weekStart, value) -> {
                if (0 < value) {
                    upsertWeeklyTiming(weekStart, timingType, value);
                    log.debug("Saved {} data for week {}: {} seconds", timingType, weekStart, value);
                }
            });
            
            log.info("Processed {} {} records", weeklyData.size(), timingType);
            
        } catch (Exception e) {
            log.error("Failed to sync {} data: {}", timingType, e.getMessage());
        }
    }

    /**
     * Insert or update weekly timing data
     */
    private ProcessTimingAnalyticsEntity upsertWeeklyTiming(LocalDate weekStartDate, TimingType timingType, Double value) {
        final ProcessTimingAnalyticsEntity entity = analyticsRepository
                .findByWeekStartDateAndTimingType(weekStartDate, timingType)
                .orElse(new ProcessTimingAnalyticsEntity(weekStartDate, timingType));
        entity.setAvgTimeSeconds(value);
        return analyticsRepository.save(entity);
    }
}
