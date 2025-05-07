package com.mosaicchurchaustin.oms.repositories;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<OrderEntity, Long> {

    interface PeriodCount {
        String getLabel();
        long   getTotal();
    }

    @Query(value = """
    SELECT
      /* you can switch to WEEKDAY() for Monday-start */
      DATE_SUB(d.date, INTERVAL (DAYOFWEEK(d.date) - 1) DAY) AS label,
      SUM(d.order_count)                             AS total
    FROM daily_order_counts d
    WHERE d.date BETWEEN :startDate AND :endDate
    GROUP BY label
    ORDER BY label
    """, nativeQuery = true)
    List<PeriodCount> findOrdersCreatedByWeek(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
