-- Read-only user for AI query feature.
-- Runs automatically on first container initialization (as root).
-- If the container already exists, recreate it:
--   docker compose down -v && docker compose up
--
-- Views are created here so grants can be applied immediately.
-- Flyway migration V00048 uses CREATE OR REPLACE VIEW to keep them
-- in schema history — CREATE OR REPLACE preserves grants.

-- ---------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------

-- One row per order with status and assignee (no PII)
CREATE OR REPLACE VIEW mosaicoms.v_order_summary AS
SELECT
    o.id                           AS order_db_id,
    o.uuid                         AS order_id,
    o.created                      AS created_at,
    o.order_status,
    COALESCE(u.name, 'Unassigned') AS assignee_name,
    o.special_instructions
FROM mosaicoms.orders o
LEFT JOIN mosaicoms.users u ON u.id = o.assignee;

-- One row per line item pre-joined with order info (no PII)
CREATE OR REPLACE VIEW mosaicoms.v_order_items_detail AS
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
FROM mosaicoms.order_items oi
JOIN mosaicoms.orders o ON o.id = oi.order_entity_id
JOIN mosaicoms.items i  ON i.id = oi.item_entity_id;

-- Managed item catalog only (managed=1 filters out ad-hoc items)
CREATE OR REPLACE VIEW mosaicoms.v_items AS
SELECT
    i.id,
    i.created,
    i.updated,
    i.description AS item_name,
    i.category,
    i.availability
FROM mosaicoms.items i
WHERE i.managed = 1;

-- Shower reservation activity (no PII)
CREATE OR REPLACE VIEW mosaicoms.v_shower_activity AS
SELECT
    sr.created                                         AS created_at,
    sr.started_at,
    sr.ended_at,
    sr.reservation_status,
    sr.shower_number,
    TIMESTAMPDIFF(MINUTE, sr.started_at, sr.ended_at) AS duration_minutes
FROM mosaicoms.shower_reservations sr;

-- Process timing analytics (week-over-week taker/fulfillment times)
CREATE OR REPLACE VIEW mosaicoms.v_process_timings AS
SELECT week_start_date, timing_type, avg_time_seconds
FROM mosaicoms.process_timing_analytics;

-- Daily order count trend (wraps existing view)
CREATE OR REPLACE VIEW mosaicoms.v_daily_order_counts AS
SELECT date, order_count
FROM mosaicoms.daily_order_counts;

-- Weekly item request counts (wraps existing view)
CREATE OR REPLACE VIEW mosaicoms.v_weekly_item_requests AS
SELECT week_start, item_name, request_count
FROM mosaicoms.weekly_item_requests_with_names;

-- Staff/volunteer users (no sensitive auth data)
CREATE OR REPLACE VIEW mosaicoms.v_users AS
SELECT
    u.id,
    u.uuid,
    u.external_id,
    u.name,
    u.username,
    u.created
FROM mosaicoms.users u;

-- Order status change history joined with order and user info
CREATE OR REPLACE VIEW mosaicoms.v_order_history AS
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
FROM mosaicoms.order_history oh
JOIN mosaicoms.orders o ON o.id = oh.order_entity_id;

-- Item attribute definitions (size, color, etc. selectors for each item)
CREATE OR REPLACE VIEW mosaicoms.v_item_attributes AS
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
FROM mosaicoms.item_attributes ia;

-- Item attribute options (the selectable values within each attribute)
CREATE OR REPLACE VIEW mosaicoms.v_item_attribute_options AS
SELECT
    iao.id,
    iao.created,
    iao.updated,
    iao.item_attribute_id,
    ia.item_entity_id AS item_id,
    iao.label,
    iao.value,
    iao.availability
FROM mosaicoms.item_attribute_options iao
JOIN mosaicoms.item_attributes ia ON ia.id = iao.item_attribute_id;

-- ---------------------------------------------------------------
-- Read-only user — SELECT on views only, no base table access
-- ---------------------------------------------------------------

CREATE USER IF NOT EXISTS 'oms_ai_agent'@'%' IDENTIFIED BY 'oms_ai_agent_dev';

GRANT SELECT ON mosaicoms.v_order_summary          TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_order_items_detail     TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_items                  TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_shower_activity        TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_process_timings        TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_daily_order_counts     TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_weekly_item_requests   TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_users                  TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_order_history          TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_item_attributes        TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_item_attribute_options TO 'oms_ai_agent'@'%';

FLUSH PRIVILEGES;
