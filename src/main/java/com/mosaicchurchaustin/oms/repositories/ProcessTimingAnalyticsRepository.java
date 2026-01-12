package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.ProcessTimingAnalyticsEntity;
import com.mosaicchurchaustin.oms.data.entity.TimingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProcessTimingAnalyticsRepository extends JpaRepository<ProcessTimingAnalyticsEntity, String> {

    Optional<ProcessTimingAnalyticsEntity> findByWeekStartDateAndTimingType(LocalDate weekStartDate, TimingType timingType);

    @Query("SELECT p FROM ProcessTimingAnalyticsEntity p WHERE p.weekStartDate >= :startDate AND p.weekStartDate <= :endDate ORDER BY p.weekStartDate")
    List<ProcessTimingAnalyticsEntity> findByWeekStartDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM ProcessTimingAnalyticsEntity p WHERE p.timingType = :timingType AND p.weekStartDate >= :startDate AND p.weekStartDate <= :endDate ORDER BY p.weekStartDate")
    List<ProcessTimingAnalyticsEntity> findByTimingTypeAndWeekStartDateBetween(@Param("timingType") TimingType timingType, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT MAX(p.weekStartDate) FROM ProcessTimingAnalyticsEntity p WHERE p.timingType = :timingType")
    Optional<LocalDate> findLatestWeekStartDateByTimingType(@Param("timingType") TimingType timingType);

    @Query("SELECT MAX(p.weekStartDate) FROM ProcessTimingAnalyticsEntity p")
    Optional<LocalDate> findLatestWeekStartDate();
}