package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.projections.SystemOverviewProjection;
import com.mosaicchurchaustin.oms.data.response.SystemMetricsResponse;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportsService {

    final OrderRepository orderRepository;
    final OrderHistoryRepository orderHistoryRepository;

    public SystemMetricsResponse getSystemMetrics(Optional<LocalDate> startDate, Optional<LocalDate> endDate, String range) {
        // Determine date range based on parameters
        Instant startInstant = null;
        Instant endInstant = null;

        if (startDate.isPresent() && endDate.isPresent()) {
            // Custom date range provided
            startInstant = startDate.get().atStartOfDay(ZoneOffset.UTC).toInstant();
            endInstant = endDate.get().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        } else if (range != null) {
            // Use preset range
            LocalDate today = LocalDate.now();
            LocalDate rangeStart = switch (range) {
                case "6weeks" -> today.minusWeeks(6);
                case "3months" -> today.minusMonths(3);
                case "6months" -> today.minusMonths(6);
                case "1year" -> today.minusYears(1);
                case "thisyear" -> LocalDate.now().withMonth(1).withDayOfMonth(1);
                case "lastyear" -> LocalDate.now().withMonth(1).withDayOfMonth(1).minusYears(1);
                default -> null; // No filter - all time
            };
            
            if (rangeStart != null) {
                startInstant = rangeStart.atStartOfDay(ZoneOffset.UTC).toInstant();
                if ("thisyear".equals(range)) {
                    endInstant = LocalDate.now().withMonth(12).withDayOfMonth(31).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
                } else if ("lastyear".equals(range)) {
                    endInstant = LocalDate.now().withMonth(1).withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();;
                } else {
                    endInstant = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
                }
            }
        }
        // If no dates and no range, query all time (both nulls)
        final SystemOverviewProjection result = orderRepository.findSystemOverview(startInstant, endInstant);
        final Long activeVolunteers = orderHistoryRepository.countDistinctByUserEntity(startInstant, endInstant);

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
}
