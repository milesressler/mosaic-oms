package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.ProcessTimingAnalyticsEntity;
import com.mosaicchurchaustin.oms.data.entity.TimingType;
import com.mosaicchurchaustin.oms.data.projections.ProcessTimingProjection;
import com.mosaicchurchaustin.oms.data.projections.SystemOverviewProjection;
import com.mosaicchurchaustin.oms.data.response.BiggestMoversResponse;
import com.mosaicchurchaustin.oms.data.response.ItemBreakdownResponse;
import com.mosaicchurchaustin.oms.data.response.ItemMetricsResponse;
import com.mosaicchurchaustin.oms.data.response.ProcessTimingsResponse;
import com.mosaicchurchaustin.oms.data.response.SystemMetricsResponse;
import com.mosaicchurchaustin.oms.repositories.AnalyticsRepository;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.ProcessTimingAnalyticsRepository;
import com.mosaicchurchaustin.oms.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportsService {

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final AnalyticsRepository analyticsRepository;
    private final ProcessTimingAnalyticsRepository processTimingAnalyticsRepository;

    public static class DateRange {
        public final LocalDate start;
        public final LocalDate end;
        public final Instant startInstant;
        public final Instant endInstant;

        public DateRange(LocalDate start, LocalDate end) {
            this.start = start;
            this.end = end;
            this.startInstant = start != null ? start.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
            this.endInstant = end != null ? end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        }
    }

    public static class ProcessTimingData {
        public final Double lagTimeSeconds;
        public final Double packToDeliverySeconds;
        public final Double distributionTimeSeconds;

        public ProcessTimingData(Double lagTimeSeconds, Double packToDeliverySeconds, Double distributionTimeSeconds) {
            this.lagTimeSeconds = lagTimeSeconds;
            this.packToDeliverySeconds = packToDeliverySeconds;
            this.distributionTimeSeconds = distributionTimeSeconds;
        }
    }

    private DateRange parseDateRange(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        LocalDate startLocalDate = null;
        LocalDate endLocalDate = null;
        LocalDate today = LocalDate.now();
        final var minimumDate = LocalDate.of(2025, 1, 1);

        if (startDate.isPresent() && endDate.isPresent()) {
            // Custom date range provided
            startLocalDate = startDate.get();
            endLocalDate = endDate.get();
        } else if (range != null) {
            // Use preset range
            LocalDate rangeStart = switch (range) {
                case "6weeks" -> today.minusWeeks(6);
                case "3months" -> today.minusMonths(3);
                case "6months" -> today.minusMonths(6).withDayOfMonth(1);
                case "1year" -> today.minusYears(1).withDayOfMonth(1);

                case "thisyear" -> LocalDate.now().withMonth(1).withDayOfMonth(1);
                case "lastyear" -> LocalDate.now().withMonth(1).withDayOfMonth(1).minusYears(1);
                case "custom" -> minimumDate; // Default for custom range without dates
                
                // Weekly ranges - find the most recent Sunday using same logic as analytics sync
                case "thisweek" -> DateUtils.getSundayStartForDate(today);
                case "lastweek" -> DateUtils.getSundayStartForDate(today).minusWeeks(1);
                
                default -> null; // No filter - all time
            };

            // Adjust so we always query starting from the first sunday in the range
            // Skip this adjustment for weekly ranges as they already start on Sunday
            if (!"thisweek".equals(range) && !"lastweek".equals(range)) {
                int dayOfWeek = rangeStart.getDayOfWeek().getValue(); // Monday=1, Sunday=7
                int daysToAdd = dayOfWeek == 7 ? 0 : 7 -dayOfWeek;
                rangeStart = rangeStart.plusDays(daysToAdd);
            }


            if (rangeStart != null) {
                startLocalDate = rangeStart;
                if ("thisyear".equals(range)) {
                    endLocalDate = LocalDate.now().withMonth(12).withDayOfMonth(31);
                } else if ("lastyear".equals(range)) {
                    endLocalDate = LocalDate.now().withMonth(1).withDayOfMonth(1).minusDays(1);
                } else if ("6weeks".equals(range)) {
                    endLocalDate = today.plusDays(1);
                } else if ("3months".equals(range)) {
                    endLocalDate = rangeStart.plusMonths(3).minusDays(1);
                } else if ("6months".equals(range)) {
                    endLocalDate = rangeStart.plusMonths(6).minusDays(1);
                } else if ("1year".equals(range)) {
                    endLocalDate = rangeStart.plusYears(1).minusDays(1);
                } else if ("thisweek".equals(range)) {
                    endLocalDate = rangeStart.plusWeeks(1).minusDays(1);
                } else if ("lastweek".equals(range)) {
                    endLocalDate = rangeStart.plusWeeks(1).minusDays(1);
                } else {
                    endLocalDate = today;
                }
            }
        }


        // Validation: end date cannot be farther ahead than today + 1 day
        if (endLocalDate == null || endLocalDate.isAfter(today.plusDays(1))) {
            endLocalDate = today.plusDays(1);
        }
        // Validation: start date cannot be farther back than 2025
        if (startLocalDate == null || startLocalDate.isBefore(minimumDate)) {
            startLocalDate = minimumDate;
        }

        return new DateRange(startLocalDate, endLocalDate);
    }

    public SystemMetricsResponse getSystemMetrics(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        
        final SystemOverviewProjection result = orderRepository.findSystemOverview(dateRange.startInstant, dateRange.endInstant);
        final Long activeVolunteers = orderHistoryRepository.countDistinctByUserEntity(dateRange.startInstant, dateRange.endInstant);

        final Long totalOrders = result.getCompletedOrders();
        final Long totalCustomers = result.getUniqueCustomers();
        final Long totalItems = result.getTotalItems();
        final Long fulfilledItems = result.getFulfilledItems();

        // Calculate derived metrics
        double avgItemsPerOrder = totalOrders > 0 ? (double) totalItems / totalOrders : 0.0;
        double fillRate = totalItems > 0 ? (double) fulfilledItems / totalItems : 0.0;

        final SystemMetricsResponse.SystemOverview overview = SystemMetricsResponse.SystemOverview.builder()
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalItems(totalItems)
                .avgItemsPerOrder(avgItemsPerOrder)
                .fillRate(fillRate)
                .activeVolunteers(activeVolunteers)
                .build();

        return SystemMetricsResponse.builder()
                .overview(overview)
                .build();
    }

    public List<AnalyticsRepository.WeeklyCustomerCount> getWeeklyCustomersServed(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        return analyticsRepository.findWeeklyCustomersServed(dateRange.start, dateRange.end);
    }

    public List<AnalyticsRepository.WeeklyItemFulfillment> getWeeklyItemFulfillment(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        return analyticsRepository.findWeeklyItemFulfillment(dateRange.start, dateRange.end);
    }

    public java.util.Map<String, java.util.Map<String, Long>> getOrderCreationPatterns(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        final List<AnalyticsRepository.OrderCreationPatternByWeek> results = analyticsRepository.findOrderCreationPatternsByWeek(dateRange.start, dateRange.end);
        
        // Generate all possible time slots from 9:00-11:00 AM in 10-minute intervals
        final String[] allTimeSlots = {
            "9:00-9:10", "9:10-9:20", "9:20-9:30", "9:30-9:40", "9:40-9:50", "9:50-10:00",
            "10:00-10:10", "10:10-10:20", "10:20-10:30", "10:30-10:40", "10:40-10:50", "10:50-11:00"
        };
        
        // Get all unique weeks in the data
        final List<LocalDate> weeks = results.stream()
            .map(AnalyticsRepository.OrderCreationPatternByWeek::getWeekStart)
            .distinct()
            .sorted()
            .toList();
        
        // Group results by timeSlot and weekStart
        final var dataByTimeSlotAndWeek = results.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                AnalyticsRepository.OrderCreationPatternByWeek::getTimeSlot,
                java.util.stream.Collectors.toMap(
                    r -> r.getWeekStart().toString(),
                    AnalyticsRepository.OrderCreationPatternByWeek::getOrderCount
                )
            ));
        
        // Return timeSlot-keyed structure: { "9:00-9:10": { "2024-01-07": 5, "2024-01-14": 3 }, ... }
        final var result = new java.util.HashMap<String, java.util.Map<String, Long>>();
        for (String timeSlot : allTimeSlots) {
            final var weekData = new java.util.HashMap<String, Long>();
            for (LocalDate week : weeks) {
                final Long count = dataByTimeSlotAndWeek.getOrDefault(timeSlot, new java.util.HashMap<>())
                    .getOrDefault(week.toString(), 0L);
                weekData.put(week.toString(), count);
            }
            result.put(timeSlot, weekData);
        }
        
        return result;
    }

    public List<BiggestMoversResponse.ItemMover> getBiggestMovers(final Optional<LocalDate> startDate, final Optional<LocalDate> endDate, final String range) {
        // Use the same date range parsing as other reports  
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        
        // Get the week containing the end date (Sunday start)
        final LocalDate targetWeekStart = DateUtils.getSundayStartForDate(dateRange.end);
        final LocalDate targetWeekEnd = targetWeekStart.plusDays(6);
        
        // Calculate 4-week average period (4 weeks prior to target week)
        final LocalDate fourWeekPeriodStart = targetWeekStart.minusWeeks(4);
        final LocalDate fourWeekPeriodEnd = targetWeekStart.minusDays(1);
        
        // Use CTE-based database query to calculate biggest movers
        return analyticsRepository.findBiggestMovers(
            targetWeekStart, targetWeekEnd,
            fourWeekPeriodStart, fourWeekPeriodEnd
        ).stream()
            .map(projection -> BiggestMoversResponse.ItemMover.builder()
                .itemName(projection.getItemName())
                .itemId(projection.getItemId())
                .thisWeekCount(projection.getThisWeekCount())
                .fourWeekAvg(projection.getFourWeekAvg())
                .absoluteChange(projection.getAbsoluteChange())
                .percentageChange(projection.getPercentageChange())
                .direction(BiggestMoversResponse.MovementDirection.valueOf(projection.getDirection()))
                .build())
            .toList();
    }

    public ProcessTimingsResponse getProcessTimings(final Optional<LocalDate> startDate, final Optional<LocalDate> endDate, final String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        
        // Get analytics timing data from database for the specified date range
        final Double orderTakerTime = getAnalyticsTimingAverage(TimingType.ORDER_TAKER_TIME, dateRange);
        final Double itemCollectionTime = getAnalyticsTimingAverage(TimingType.FULFILLMENT_TIME, dateRange);
        
        // Get database-based timings using the same date range approach as other reports
        final ProcessTimingProjection timingData = calculateDatabaseTimings(dateRange);
        final Double lagTimeForPacking = timingData.getAvgLagTimeSeconds();
        final Double packedToDeliveredTime = timingData.getAvgPackToDeliverySeconds();
        final Double distributionTime = timingData.getAvgDistributionTimeSeconds();
        final Double totalTime = timingData.getAvgTotalTimeSeconds() + orderTakerTime;

        final List<ProcessTimingsResponse.ProcessStage> stages = List.of(
            ProcessTimingsResponse.ProcessStage.builder()
                .stage("Order Taker Time")
                .avgTime(orderTakerTime)
                .description("Time to take and input order")
                .build(),
            ProcessTimingsResponse.ProcessStage.builder()
                .stage("Lag Time to Process")
                .avgTime(lagTimeForPacking)
                .description("Wait time before packing starts")
                .build(),
            ProcessTimingsResponse.ProcessStage.builder()
                .stage("Time to Pack")
                .avgTime(itemCollectionTime)
                .description("Active item collection and packing")
                .build(),
            ProcessTimingsResponse.ProcessStage.builder()
                .stage("Packed to Delivered")
                .avgTime(packedToDeliveredTime)
                .description("Time from packed to transferred/delivered")
                .build(),
            ProcessTimingsResponse.ProcessStage.builder()
                .stage("Time to Complete Distribution")
                .avgTime(distributionTime)
                .description("Final distribution to customer")
                .build()
        );

        return ProcessTimingsResponse.builder()
                .totalEndToEndTime(totalTime)
                .processStages(stages)
                .build();
    }

    private Double getAnalyticsTimingAverage(final TimingType timingType, final DateRange dateRange) {
        final List<ProcessTimingAnalyticsEntity> analyticsData = 
            processTimingAnalyticsRepository.findByTimingTypeAndWeekStartDateBetween(
                timingType, dateRange.start, dateRange.end);
        
        if (analyticsData.isEmpty()) {
            return null;
        }
        
        // Calculate weighted average based on available data
        final double average = analyticsData.stream()
            .filter(data -> data.getAvgTimeSeconds() != null)
            .mapToDouble(ProcessTimingAnalyticsEntity::getAvgTimeSeconds)
            .average()
            .orElse(0.0);
            
        return average > 0 ? average : null;
    }

    private ProcessTimingProjection calculateDatabaseTimings(final DateRange dateRange) {
        return orderHistoryRepository.findProcessTimingsForCompletedOrders(
            dateRange.startInstant, 
            dateRange.endInstant
        );
    }

    public ItemMetricsResponse getItemMetrics(Long itemId, Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        
        final AnalyticsRepository.ItemMetricsProjection result = analyticsRepository.findItemMetrics(itemId, dateRange.start, dateRange.end);
        
        final Long totalRequested = result.getTotalRequested();
        final Long totalFulfilled = result.getTotalFulfilled();
        
        // Calculate fill rate
        double fillRate = totalRequested > 0 ? (double) totalFulfilled / totalRequested : 0.0;
        
        return ItemMetricsResponse.builder()
                .totalRequested(totalRequested)
                .totalFulfilled(totalFulfilled)
                .fillRate(fillRate)
                .build();
    }

    public ItemBreakdownResponse getItemBreakdown(Long itemId, String groupBy, String secondaryGroupBy, Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        final DateRange dateRange = parseDateRange(startDate, endDate, range);
        
        final List<AnalyticsRepository.ItemBreakdownProjection> results = analyticsRepository.findItemBreakdown(
                itemId, groupBy, secondaryGroupBy, dateRange.start, dateRange.end);
        
        final List<ItemBreakdownResponse.ItemBreakdownData> data = results.stream()
                .map(projection -> ItemBreakdownResponse.ItemBreakdownData.builder()
                        .weekStart(projection.getWeekStart())
                        .primaryValue(projection.getPrimaryValue())
                        .secondaryValue(projection.getSecondaryValue())
                        .requestedCount(projection.getRequestedCount())
                        .fulfilledCount(projection.getFulfilledCount())
                        .build())
                .toList();
        
        return ItemBreakdownResponse.builder()
                .itemId(itemId)
                .groupBy(groupBy)
                .secondaryGroupBy(secondaryGroupBy)
                .data(data)
                .build();
    }
}
