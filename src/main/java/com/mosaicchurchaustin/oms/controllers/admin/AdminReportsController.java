package com.mosaicchurchaustin.oms.controllers.admin;

import com.mosaicchurchaustin.oms.data.domain.analytics.ReportingPeriod;
import com.mosaicchurchaustin.oms.services.analytics.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

}
