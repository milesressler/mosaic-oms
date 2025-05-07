package com.mosaicchurchaustin.oms.services.analytics;

import com.mosaicchurchaustin.oms.data.domain.analytics.ReportingPeriod;
import com.mosaicchurchaustin.oms.repositories.AnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ReportingService {

    @Autowired
    AnalyticsRepository analyticsRepository;

    public Object ordersReport(final ReportingPeriod reportingPeriod, final int periodCount) {


        final LocalDate endDate   = LocalDate.now();               // today
        final LocalDate startDate = switch (reportingPeriod) {
            case MONTHLY -> endDate.minusMonths(periodCount - 1).withDayOfMonth(1);
            case WEEKLY         -> endDate.minusWeeks(periodCount - 1);
            default         -> endDate.minusWeeks(periodCount - 1);
        };
        return analyticsRepository.findOrdersCreatedByWeek(startDate, endDate);

    }
}
