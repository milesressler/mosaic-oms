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
         JOIN order_items oi ON oi.order_entity_id = o.id
         JOIN items i        ON i.id      = oi.item_entity_id
GROUP BY
    week_start,
    oi.item_entity_id,
    i.description;
