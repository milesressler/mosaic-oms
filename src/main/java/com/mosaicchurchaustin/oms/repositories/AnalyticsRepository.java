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
    // Projection for each row
    interface TopItemLastWeek {
        LocalDate getWeekStart();
        Long   getItemEntityId();
        String getItemName();
        Long   getRequestCount();
    }

    // Always returns the top‐10 items from last week (Sunday-to-Saturday)
    @Query(value = """
        SELECT
          w.week_start     AS weekStart,
          w.item_entity_id    AS itemEntityId,
          w.item_name         AS itemName,
          w.request_count     AS requestCount
        FROM weekly_item_requests_with_names w
        WHERE w.week_start = DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY)
        ORDER BY w.request_count DESC
        LIMIT 10
        """, nativeQuery = true)
    List<TopItemLastWeek> findTopItemsLastWeek();

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
