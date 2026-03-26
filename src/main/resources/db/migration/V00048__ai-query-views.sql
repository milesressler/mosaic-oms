-- Views for the AI query feature.
-- The read-only DB user (oms_readonly) is granted SELECT on these views only.
-- Grants are managed via docker/mysql-init/01-readonly-user.sql (dev)
-- and must be applied manually by a DBA in production:
--
--   GRANT SELECT ON mosaicoms.v_order_summary        TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_order_items_detail   TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_items                TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_shower_activity      TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_process_timings      TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_daily_order_counts   TO 'oms_readonly'@'%';
--   GRANT SELECT ON mosaicoms.v_weekly_item_requests TO 'oms_readonly'@'%';

CREATE OR REPLACE VIEW v_order_summary AS
SELECT
    o.uuid                                                AS order_id,
    o.created                                             AS created_at,
    o.order_status,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    COALESCE(u.name, 'Unassigned')                        AS assignee_name,
    o.special_instructions
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN users u ON u.id = o.assignee;

CREATE OR REPLACE VIEW v_order_items_detail AS
SELECT
    o.uuid                                                AS order_id,
    o.created                                             AS order_created_at,
    o.order_status,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    i.description                                         AS item_name,
    i.category                                            AS item_category,
    oi.quantity,
    oi.quantity_fulfilled,
    oi.notes
FROM order_items oi
JOIN orders o    ON o.id = oi.order_entity_id
JOIN customers c ON c.id = o.customer_id
JOIN items i     ON i.id = oi.item_entity_id;

CREATE OR REPLACE VIEW v_items AS
SELECT
    description AS item_name,
    category,
    availability
FROM items;

CREATE OR REPLACE VIEW v_shower_activity AS
SELECT
    sr.created                                            AS created_at,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    sr.started_at,
    sr.ended_at,
    sr.reservation_status,
    sr.shower_number,
    TIMESTAMPDIFF(MINUTE, sr.started_at, sr.ended_at)    AS duration_minutes
FROM shower_reservations sr
JOIN customers c ON c.id = sr.customer_id;

CREATE OR REPLACE VIEW v_process_timings AS
SELECT week_start_date, timing_type, avg_time_seconds
FROM process_timing_analytics;

CREATE OR REPLACE VIEW v_daily_order_counts AS
SELECT date, order_count
FROM daily_order_counts;

CREATE OR REPLACE VIEW v_weekly_item_requests AS
SELECT week_start, item_name, request_count
FROM weekly_item_requests_with_names;
