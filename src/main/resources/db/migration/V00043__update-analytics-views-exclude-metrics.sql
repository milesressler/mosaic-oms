-- Update analytics views to exclude customers with excludeFromMetrics = true

CREATE OR REPLACE VIEW daily_order_counts AS
WITH RECURSIVE
    date_range AS (
        -- start at the earliest order date, or today if no orders yet
        SELECT COALESCE(MIN(DATE(created)), CURDATE()) AS dt
        FROM orders
        UNION ALL
        -- keep adding one day until we hit today
        SELECT dr.dt + INTERVAL 1 DAY
        FROM date_range dr
        WHERE dr.dt + INTERVAL 1 DAY <= CURDATE()
    )
SELECT
    dr.dt         AS `date`,
    COALESCE(o.cnt, 0) AS order_count
FROM date_range dr
         LEFT JOIN (
    SELECT DATE(o.created) AS dt, COUNT(*) AS cnt
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.exclude_from_metrics = FALSE
    GROUP BY DATE(o.created)
) o ON dr.dt = o.dt;

CREATE OR REPLACE VIEW weekly_item_requests_with_names AS
SELECT
    -- week_start is the Sunday of that week
    DATE_SUB(
            DATE(o.created),
            INTERVAL (DAYOFWEEK(o.created) - 1) DAY
    )                              AS week_start,
    oi.item_entity_id,
    i.description                         AS item_name,
    COUNT(*)                       AS request_count
FROM orders o
         JOIN customers c ON o.customer_id = c.id
         JOIN order_items oi ON oi.order_entity_id = o.id
         JOIN items i        ON i.id      = oi.item_entity_id
WHERE c.exclude_from_metrics = FALSE
GROUP BY
    week_start,
    oi.item_entity_id,
    i.description;