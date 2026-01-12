package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "process_timing_analytics")
@Getter
@Setter
@NoArgsConstructor
public class ProcessTimingAnalyticsEntity extends BaseEntity {

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "timing_type", nullable = false, length = 50)
    private TimingType timingType;

    @Column(name = "avg_time_seconds")
    private Double avgTimeSeconds;

    public ProcessTimingAnalyticsEntity(final LocalDate weekStartDate, final TimingType timingType) {
        this.weekStartDate = weekStartDate;
        this.timingType = timingType;
    }

    @Override
    public String getEntityType() {
        return "ProcessTimingAnalytics";
    }
}
