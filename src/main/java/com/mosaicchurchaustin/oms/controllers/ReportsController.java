package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.SystemMetricsResponse;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    final ReportsService reportsService;

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
}