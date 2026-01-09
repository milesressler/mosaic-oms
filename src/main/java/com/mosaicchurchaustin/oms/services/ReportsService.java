package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.projections.SystemOverviewProjection;
import com.mosaicchurchaustin.oms.data.response.BiggestMoversResponse;
import com.mosaicchurchaustin.oms.data.response.SystemMetricsResponse;
import com.mosaicchurchaustin.oms.repositories.AnalyticsRepository;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportsService {

    final OrderRepository orderRepository;
    final OrderHistoryRepository orderHistoryRepository;
    final AnalyticsRepository analyticsRepository;

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
                default -> null; // No filter - all time
            };

            // Adjust so we always query starting from the first sunday in the range
            int dayOfWeek = rangeStart.getDayOfWeek().getValue(); // Monday=1, Sunday=7
            int daysToAdd = dayOfWeek == 7 ? 0 : 7 -dayOfWeek;
            rangeStart = rangeStart.plusDays(daysToAdd);


            if (rangeStart != null) {
                startLocalDate = rangeStart;
                if ("thisyear".equals(range)) {
                    endLocalDate = LocalDate.now().withMonth(12).withDayOfMonth(31);
                } else if ("lastyear".equals(range)) {
                    endLocalDate = LocalDate.now().withMonth(1).withDayOfMonth(1).minusDays(1);
                } else if ("6weeks".equals(range)) {
                    endLocalDate = rangeStart.plusWeeks(6).minusDays(1);
                } else if ("3months".equals(range)) {
                    endLocalDate = rangeStart.plusMonths(3).minusDays(1);
                } else if ("6months".equals(range)) {
                    endLocalDate = rangeStart.plusMonths(6).minusDays(1);
                } else if ("1year".equals(range)) {
                    endLocalDate = rangeStart.plusYears(1).minusDays(1);
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

    public List<BiggestMoversResponse.ItemMover> getBiggestMovers(String range) {
        LocalDate today = LocalDate.now();
        
        // Calculate this week date range
        // Find the most recent Sunday as start of "this week"
        LocalDate thisWeekStart = today;
        while (thisWeekStart.getDayOfWeek().getValue() != 7) { // 7 = Sunday
            thisWeekStart = thisWeekStart.minusDays(1);
        }
        LocalDate thisWeekEnd = thisWeekStart.plusWeeks(1).minusDays(1);
        
        // Calculate 4-week average period (excluding current week)
        LocalDate fourWeekPeriodStart = thisWeekStart.minusWeeks(4);
        LocalDate fourWeekPeriodEnd = thisWeekStart.minusDays(1);
        
        // Get item counts for this week and the 4-week period
        List<AnalyticsRepository.WeeklyItemRequestCount> thisWeekCounts = 
            analyticsRepository.findWeeklyItemRequestCounts(thisWeekStart, thisWeekEnd);
        List<AnalyticsRepository.WeeklyItemRequestCount> fourWeekCounts = 
            analyticsRepository.findWeeklyItemRequestCounts(fourWeekPeriodStart, fourWeekPeriodEnd);
        
        // Convert this week to map for easier lookup
        var thisWeekMap = thisWeekCounts.stream()
            .collect(java.util.stream.Collectors.toMap(
                AnalyticsRepository.WeeklyItemRequestCount::getItemName, 
                AnalyticsRepository.WeeklyItemRequestCount::getRequestCount));
        
        // Calculate 4-week average for each item
        var averageMap = new java.util.HashMap<String, Double>();
        fourWeekCounts.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                AnalyticsRepository.WeeklyItemRequestCount::getItemName,
                java.util.stream.Collectors.summingLong(AnalyticsRepository.WeeklyItemRequestCount::getRequestCount)))
            .forEach((itemName, totalCount) -> 
                averageMap.put(itemName, totalCount / 4.0)); // 4-week average
        
        // Find all items that appeared in either this week or the 4-week period
        var allItems = new java.util.HashSet<String>();
        allItems.addAll(thisWeekMap.keySet());
        allItems.addAll(averageMap.keySet());
        
        // Calculate changes vs average and create movers
        List<BiggestMoversResponse.ItemMover> movers = allItems.stream()
            .map(itemName -> {
                Long thisWeekCount = thisWeekMap.getOrDefault(itemName, 0L);
                Double weeklyAverage = averageMap.getOrDefault(itemName, 0.0);
                Long averageAsLong = Math.round(weeklyAverage);
                Long absoluteChange = thisWeekCount - averageAsLong;
                
                Double percentageChange = weeklyAverage > 0 
                    ? ((double) absoluteChange / weeklyAverage) * 100 
                    : (thisWeekCount > 0 ? 100.0 : 0.0);
                
                BiggestMoversResponse.MovementDirection direction;
                if (absoluteChange > 0) direction = BiggestMoversResponse.MovementDirection.UP;
                else if (absoluteChange < 0) direction = BiggestMoversResponse.MovementDirection.DOWN;
                else direction = BiggestMoversResponse.MovementDirection.FLAT;
                
                return BiggestMoversResponse.ItemMover.builder()
                    .itemName(itemName)
                    .itemId(itemName) // Using name as ID for now
                    .thisWeekCount(thisWeekCount)
                    .lastWeekCount(averageAsLong) // Using average in place of lastWeekCount for consistency
                    .absoluteChange(absoluteChange)
                    .percentageChange(percentageChange)
                    .direction(direction)
                    .build();
            })
            // Filter out items with very low volume to reduce noise
            .filter(mover -> Math.max(mover.getThisWeekCount().intValue(), mover.getLastWeekCount().intValue()) >= 2)
            // Sort by absolute change (biggest movers first)
            .sorted((a, b) -> Math.toIntExact(Math.abs(b.getAbsoluteChange()) - Math.abs(a.getAbsoluteChange())))
            // Take top 10
            .limit(10)
            .toList();
        
        return movers;
    }
}
