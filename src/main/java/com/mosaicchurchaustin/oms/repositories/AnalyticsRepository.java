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

    interface WeeklyCustomerCount {
        LocalDate getWeekStart();
        Long getTotalCustomers();
        Long getNewCustomers();
    }

    interface WeeklyItemFulfillment {
        LocalDate getWeekStart();
        Long getTotalItems();
        Long getFilledItems();
        Long getUnfilledItems();
    }

    interface OrderCreationPattern {
        String getTimeSlot();
        Long getOrderCount();
    }

    interface OrderCreationPatternByWeek {
        String getTimeSlot();
        LocalDate getWeekStart();
        Long getOrderCount();
    }

    interface WeeklyItemRequestCount {
        String getItemName();
        Long getRequestCount();
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

    @Query(value = """
    WITH RECURSIVE week_series AS (
        -- Generate series of weeks from start to end date
        SELECT DATE_SUB(:startDate, INTERVAL (DAYOFWEEK(:startDate) - 1) DAY) AS week_start
        UNION ALL
        SELECT DATE_ADD(week_start, INTERVAL 7 DAY)
        FROM week_series
        WHERE DATE_ADD(week_start, INTERVAL 7 DAY) <= DATE_SUB(:endDate, INTERVAL (DAYOFWEEK(:endDate) - 1) DAY)
    ),
    completed_orders_in_range AS (
        SELECT
            o.id,
            o.customer_id,
            DATE_SUB(DATE(o.created), INTERVAL (DAYOFWEEK(o.created) - 1) DAY) AS week_start
        FROM orders o join customers c
        WHERE o.order_status = 'COMPLETED'
            AND o.created BETWEEN :startDate AND :endDate
            and c.exclude_from_metrics != 1
    ),
    first_completed_orders AS (
        SELECT
            o.customer_id,
            MIN(o.id) as first_order_id
        FROM orders o
        WHERE o.order_status = 'COMPLETED'
        GROUP BY o.customer_id
    ),
    weekly_stats AS (
        SELECT
            ws.week_start,
            COUNT(DISTINCT cor.customer_id) as total_customers,
            COUNT(DISTINCT CASE
                WHEN fco.first_order_id = cor.id THEN cor.customer_id
            END) as new_customers
        FROM week_series ws
        LEFT JOIN completed_orders_in_range cor ON cor.week_start = ws.week_start
        LEFT JOIN first_completed_orders fco ON fco.customer_id = cor.customer_id
        GROUP BY ws.week_start
    )
    SELECT
        ws.week_start AS weekStart,
        ws.total_customers AS totalCustomers,
        ws.new_customers AS newCustomers
    FROM weekly_stats ws
    ORDER BY ws.week_start
    """, nativeQuery = true)
    List<WeeklyCustomerCount> findWeeklyCustomersServed(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    WITH RECURSIVE week_series AS (
        -- Generate series of weeks from start to end date
        SELECT DATE_SUB(:startDate, INTERVAL (DAYOFWEEK(:startDate) - 1) DAY) AS week_start
        UNION ALL
        SELECT DATE_ADD(week_start, INTERVAL 7 DAY)
        FROM week_series
        WHERE DATE_ADD(week_start, INTERVAL 7 DAY) <= DATE_SUB(:endDate, INTERVAL (DAYOFWEEK(:endDate) - 1) DAY)
    ),
    completed_orders_in_range AS (
        SELECT
            o.id,
            DATE_SUB(DATE(o.created), INTERVAL (DAYOFWEEK(o.created) - 1) DAY) AS week_start
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        WHERE o.order_status = 'COMPLETED'
            AND o.created BETWEEN :startDate AND :endDate
            AND (c.exclude_from_metrics IS NULL OR c.exclude_from_metrics = 0)
    ),
    weekly_item_stats AS (
        SELECT
            ws.week_start,
            COALESCE(SUM(oi.quantity), 0) as total_items,
            COALESCE(SUM(CASE WHEN oi.quantity_fulfilled = 1 THEN oi.quantity ELSE 0 END), 0) as filled_items,
            COALESCE(SUM(CASE WHEN oi.quantity_fulfilled = 0 OR oi.quantity_fulfilled IS NULL THEN oi.quantity ELSE 0 END), 0) as unfilled_items
        FROM week_series ws
        LEFT JOIN completed_orders_in_range cor ON cor.week_start = ws.week_start
        LEFT JOIN order_items oi ON oi.order_entity_id = cor.id
        GROUP BY ws.week_start
    )
    SELECT
        wis.week_start AS weekStart,
        wis.total_items AS totalItems,
        wis.filled_items AS filledItems,
        wis.unfilled_items AS unfilledItems
    FROM weekly_item_stats wis
    ORDER BY wis.week_start
    """, nativeQuery = true)
    List<WeeklyItemFulfillment> findWeeklyItemFulfillment(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    SELECT 
        CASE 
            WHEN MINUTE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) < 10 
                THEN CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':00-', HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':10')
            WHEN MINUTE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) < 20 
                THEN CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':10-', HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':20')
            WHEN MINUTE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) < 30 
                THEN CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':20-', HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':30')
            WHEN MINUTE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) < 40 
                THEN CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':30-', HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':40')
            WHEN MINUTE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) < 50 
                THEN CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':40-', HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':50')
            ELSE CONCAT(HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), ':50-', (HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) + 1), ':00')
        END AS timeSlot,
        DATE_SUB(DATE(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')), INTERVAL (DAYOFWEEK(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) - 1) DAY) AS weekStart,
        COUNT(*) AS orderCount
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    WHERE o.order_status = 'COMPLETED'
        AND o.created BETWEEN :startDate AND :endDate
        AND c.exclude_from_metrics = 0
        AND DAYOFWEEK(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) = 1
        AND HOUR(CONVERT_TZ(o.created, 'UTC', 'America/Chicago')) BETWEEN 9 AND 10
    GROUP BY timeSlot, weekStart
    ORDER BY weekStart, timeSlot
    """, nativeQuery = true)
    List<OrderCreationPatternByWeek> findOrderCreationPatternsByWeek(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
    SELECT 
        i.description AS itemName,
        SUM(oi.quantity) AS requestCount
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    INNER JOIN order_items oi ON oi.order_entity_id = o.id
    INNER JOIN items i ON i.id = oi.item_entity_id
    WHERE (o.order_status = 'COMPLETED' OR o.order_status = 'CANCELLED')
        AND o.created BETWEEN :startDate AND :endDate
        AND (c.exclude_from_metrics IS NULL OR c.exclude_from_metrics = 0)
    GROUP BY i.description
    ORDER BY requestCount DESC
    """, nativeQuery = true)
    List<WeeklyItemRequestCount> findWeeklyItemRequestCounts(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
with valid_order_items as (
    select o.created, oi.item_entity_id, oi.quantity
    from orders o
             inner join order_items oi on oi.order_entity_id = o.id
             inner join customers c on c.id = o.customer_id
    WHERE (o.order_status = 'COMPLETED' OR o.order_status = 'CANCELLED')
      AND o.created BETWEEN :fourWeekStart AND :targetWeekEnd
      AND (c.exclude_from_metrics != 1)
), target_week_items AS (
    -- Items in the target week with their request counts
    SELECT
        oi.item_entity_id AS item_id,
        SUM(oi.quantity) AS target_week_count
    FROM valid_order_items oi
    WHERE oi.created BETWEEN :targetWeekStart AND :targetWeekEnd
    GROUP BY oi.item_entity_id
    HAVING SUM(oi.quantity) >= 3  -- Minimum volume filter
),
     four_week_averages AS (
         -- 4-week averages for items from target week
         SELECT
             oi.item_entity_id AS item_id,
             COALESCE(sum(oi.quantity), 0)/4 AS four_week_avg
         FROM target_week_items twi left join valid_order_items oi
                                              on twi.item_id = oi.item_entity_id
                                              and oi.created BETWEEN :fourWeekStart AND :fourWeekEnd
         GROUP BY oi.item_entity_id
     ) SELECT
           items.description as itemName,
           items.id as itemId,
           tw.target_week_count AS thisWeekCount,
           ROUND(fwa.four_week_avg, 2) as fourWeekAvg,  -- Added rounding for consistency
           (tw.target_week_count - ROUND(COALESCE(fwa.four_week_avg, 0))) AS absoluteChange,
           CASE
               WHEN COALESCE(fwa.four_week_avg, 0) > 0
                   THEN ROUND(((tw.target_week_count - fwa.four_week_avg) / fwa.four_week_avg) * 100, 2)
               WHEN tw.target_week_count > 0
                   THEN 100.0
               ELSE 0.0
               END AS percentageChange,
           CASE
               WHEN tw.target_week_count > ROUND(COALESCE(fwa.four_week_avg, 0)) THEN 'UP'
               WHEN tw.target_week_count < ROUND(COALESCE(fwa.four_week_avg, 0)) THEN 'DOWN'
               ELSE 'FLAT'
               END AS direction
FROM target_week_items tw
         LEFT JOIN four_week_averages fwa ON tw.item_id = fwa.item_id
         LEFT JOIN items ON tw.item_id = items.id
ORDER BY ABS(percentageChange) DESC
LIMIT 10
    """, nativeQuery = true)
    List<BiggestMoversProjection> findBiggestMovers(
            @Param("targetWeekStart") LocalDate targetWeekStart,
            @Param("targetWeekEnd") LocalDate targetWeekEnd,
            @Param("fourWeekStart") LocalDate fourWeekStart,
            @Param("fourWeekEnd") LocalDate fourWeekEnd
    );

    interface BiggestMoversProjection {
        String getItemName();
        String getItemId();
        Long getThisWeekCount();
        Double getFourWeekAvg();
        Long getAbsoluteChange();
        Double getPercentageChange();
        String getDirection();
    }
}
