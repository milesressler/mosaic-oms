package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.BiggestMoversResponse;
import com.mosaicchurchaustin.oms.data.response.ProcessTimingsResponse;
import com.mosaicchurchaustin.oms.data.response.SystemMetricsResponse;
import com.mosaicchurchaustin.oms.repositories.AnalyticsRepository;
import com.mosaicchurchaustin.oms.services.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    final ReportsService reportsService;
    final AnalyticsRepository analyticsRepository;

    @ResponseBody
    @GetMapping(path = "/system-metrics", produces = MediaType.APPLICATION_JSON_VALUE)
    public SystemMetricsResponse getSystemMetrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "6weeks") String range) {
        
        return reportsService.getSystemMetrics(
            Optional.ofNullable(startDate), 
            Optional.ofNullable(endDate), 
            range
        );
    }

    @ResponseBody
    @GetMapping(path = "/weekly-customers-served", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<AnalyticsRepository.WeeklyCustomerCount> getWeeklyCustomersServed(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "6weeks") String range) {

        return reportsService.getWeeklyCustomersServed(
            Optional.ofNullable(startDate),
            Optional.ofNullable(endDate),
            range
        );
    }

    @ResponseBody
    @GetMapping(path = "/weekly-item-fulfillment", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<AnalyticsRepository.WeeklyItemFulfillment> getWeeklyItemFulfillment(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "6weeks") String range) {

        return reportsService.getWeeklyItemFulfillment(
            Optional.ofNullable(startDate),
            Optional.ofNullable(endDate),
            range
        );
    }

    @ResponseBody
    @GetMapping(path = "/order-creation-patterns", produces = MediaType.APPLICATION_JSON_VALUE)
    public java.util.Map<String, java.util.Map<String, Long>> getOrderCreationPatterns(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "6weeks") String range) {

        return reportsService.getOrderCreationPatterns(
            Optional.ofNullable(startDate),
            Optional.ofNullable(endDate),
            range
        );
    }

    @ResponseBody
    @GetMapping(path = "/biggest-movers", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<BiggestMoversResponse.ItemMover> getBiggestMovers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "thisweek") String range) {
        
        return reportsService.getBiggestMovers(
            Optional.ofNullable(startDate),
            Optional.ofNullable(endDate),
            range
        );
    }

    @ResponseBody
    @GetMapping(path = "/process-timings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ProcessTimingsResponse getProcessTimings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "6weeks") String range) {
        
        return reportsService.getProcessTimings(Optional.ofNullable(startDate), Optional.ofNullable(endDate), range);
    }
}