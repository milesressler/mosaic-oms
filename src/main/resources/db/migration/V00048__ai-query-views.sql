-- Views for the AI query feature.
-- The read-only DB user (oms_ai_agent) is granted SELECT on these views only.
-- Grants are managed via docker/mysql-init/01-readonly-user.sql (dev)
-- and must be applied manually by a DBA in production:
--
--   GRANT SELECT ON mosaicoms.v_order_summary          TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_order_items_detail     TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_items                  TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_shower_activity        TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_process_timings        TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_daily_order_counts     TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_weekly_item_requests   TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_users                  TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_order_history          TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_item_attributes        TO 'oms_ai_agent'@'%';
--   GRANT SELECT ON mosaicoms.v_item_attribute_options TO 'oms_ai_agent'@'%';

-- One row per order with status and assignee (no PII; test customers excluded)
CREATE OR REPLACE VIEW v_order_summary AS
SELECT
    o.id                           AS order_db_id,
    o.uuid                         AS order_id,
    o.created                      AS created_at,
    o.order_status,
    COALESCE(u.name, 'Unassigned') AS assignee_name,
    o.special_instructions
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN users u ON u.id = o.assignee
WHERE c.exclude_from_metrics = 0;

-- One row per line item pre-joined with order info (no PII; test customers excluded)
CREATE OR REPLACE VIEW v_order_items_detail AS
SELECT
    o.id                   AS order_db_id,
    o.uuid                 AS order_id,
    o.created              AS order_created_at,
    o.order_status,
    oi.id                  AS order_item_id,
    i.id                   AS item_id,
    i.description          AS item_name,
    i.category             AS item_category,
    oi.quantity,
    oi.quantity_fulfilled,
    oi.notes,
    oi.attributes
FROM order_items oi
JOIN orders o    ON o.id = oi.order_entity_id
JOIN customers c ON c.id = o.customer_id
JOIN items i     ON i.id = oi.item_entity_id
WHERE c.exclude_from_metrics = 0;

-- Managed item catalog only (managed=1 filters out ad-hoc items)
CREATE OR REPLACE VIEW v_items AS
SELECT
    i.id,
    i.created,
    i.updated,
    i.description AS item_name,
    i.category,
    i.availability
FROM items i
WHERE i.managed = 1;

-- Shower reservation activity (no PII; test customers excluded)
CREATE OR REPLACE VIEW v_shower_activity AS
SELECT
    sr.created                                         AS created_at,
    sr.started_at,
    sr.ended_at,
    sr.reservation_status,
    sr.shower_number,
    TIMESTAMPDIFF(MINUTE, sr.started_at, sr.ended_at) AS duration_minutes
FROM shower_reservations sr
JOIN customers c ON c.id = sr.customer_id
WHERE c.exclude_from_metrics = 0;

-- Process timing analytics (week-over-week taker/fulfillment times)
CREATE OR REPLACE VIEW v_process_timings AS
SELECT week_start_date, timing_type, avg_time_seconds
FROM process_timing_analytics;

-- Daily order count trend (wraps existing view)
CREATE OR REPLACE VIEW v_daily_order_counts AS
SELECT date, order_count
FROM daily_order_counts;

-- Weekly item request counts (wraps existing view)
CREATE OR REPLACE VIEW v_weekly_item_requests AS
SELECT week_start, item_name, request_count
FROM weekly_item_requests_with_names;

-- Staff/volunteer user accounts
CREATE OR REPLACE VIEW v_users AS
SELECT
    u.id,
    u.uuid,
    u.external_id,
    u.name,
    u.username,
    u.created
FROM users u;

-- Order status change audit trail (test customers excluded)
CREATE OR REPLACE VIEW v_order_history AS
SELECT
    oh.id,
    o.id              AS order_db_id,
    o.uuid            AS order_id,
    oh.timestamp,
    oh.type,
    oh.order_status,
    oh.previous_order_status,
    oh.export_type,
    oh.comment,
    oh.user_entity_id AS user_id
FROM order_history oh
JOIN orders o    ON o.id = oh.order_entity_id
JOIN customers c ON c.id = o.customer_id
WHERE c.exclude_from_metrics = 0;

-- Item attribute definitions (size, color, etc. selectors for each item)
CREATE OR REPLACE VIEW v_item_attributes AS
SELECT
    ia.id,
    ia.created,
    ia.updated,
    ia.item_entity_id AS item_id,
    ia.type,
    ia.label,
    ia.value,
    ia.required,
    ia.group_name,
    ia.group_order
FROM item_attributes ia;

-- Item attribute options (the selectable values within each attribute)
CREATE OR REPLACE VIEW v_item_attribute_options AS
SELECT
    iao.id,
    iao.created,
    iao.updated,
    iao.item_attribute_id,
    ia.item_entity_id AS item_id,
    iao.label,
    iao.value,
    iao.availability
FROM item_attribute_options iao
JOIN item_attributes ia ON ia.id = iao.item_attribute_id;
