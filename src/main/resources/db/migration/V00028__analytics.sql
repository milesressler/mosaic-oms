
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
    SELECT DATE(created) AS dt, COUNT(*) AS cnt
    FROM orders
    GROUP BY DATE(created)
) o ON dr.dt = o.dt;

