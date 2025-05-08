package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.domain.analytics.ReportingPeriod;
import com.mosaicchurchaustin.oms.repositories.AnalyticsRepository;
import com.mosaicchurchaustin.oms.services.analytics.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    @Autowired
    ReportingService reportingService;

    @GetMapping(path = "/orders-created", produces = MediaType.APPLICATION_JSON_VALUE)
    public Object ordersCreated(@RequestParam(name = "period") ReportingPeriod reportingPeriod,
                                @RequestParam(name = "count") int periodCount) {
        return reportingService.ordersReport(reportingPeriod, periodCount);
    }


    @GetMapping("/top-requested-items-last-week")
    public ResponseEntity<Map<String, Object>> topRequestedItemsLastWeek() {
        List<AnalyticsRepository.TopItemLastWeek> data = reportingService.getTopItemsLastWeek();

        LocalDate weekStart;
        if (!data.isEmpty()) {
            weekStart = data.get(0).getWeekStart();
        } else {
            // fallback: compute last week’s Sunday in Java
            LocalDate today = LocalDate.now();
            int dow = today.getDayOfWeek().getValue() % 7;  // Sunday→0, Monday→1…Saturday→6
            LocalDate thisSunday = today.minusDays(dow);
            weekStart = thisSunday.minusWeeks(1);
        }

        return ResponseEntity.ok(Map.of(
                "period",    "last_week",
                "weekStart", weekStart,
                "data",      data
        ));
    }

}
