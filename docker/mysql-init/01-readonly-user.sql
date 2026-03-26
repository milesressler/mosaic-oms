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

-- One row per order with readable customer and assignee names
CREATE OR REPLACE VIEW mosaicoms.v_order_summary AS
SELECT
    o.uuid                                                AS order_id,
    o.created                                             AS created_at,
    o.order_status,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    COALESCE(u.name, 'Unassigned')                        AS assignee_name,
    o.special_instructions
FROM mosaicoms.orders o
JOIN mosaicoms.customers c ON c.id = o.customer_id
LEFT JOIN mosaicoms.users u ON u.id = o.assignee;

-- One row per line item, pre-joined with order and customer info
CREATE OR REPLACE VIEW mosaicoms.v_order_items_detail AS
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
FROM mosaicoms.order_items oi
JOIN mosaicoms.orders o    ON o.id = oi.order_entity_id
JOIN mosaicoms.customers c ON c.id = o.customer_id
JOIN mosaicoms.items i     ON i.id = oi.item_entity_id;

-- Item catalog (name, category, availability only)
CREATE OR REPLACE VIEW mosaicoms.v_items AS
SELECT
    description AS item_name,
    category,
    availability
FROM mosaicoms.items;

-- Shower reservations with customer names and computed duration
CREATE OR REPLACE VIEW mosaicoms.v_shower_activity AS
SELECT
    sr.created                                            AS created_at,
    CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
    sr.started_at,
    sr.ended_at,
    sr.reservation_status,
    sr.shower_number,
    TIMESTAMPDIFF(MINUTE, sr.started_at, sr.ended_at)    AS duration_minutes
FROM mosaicoms.shower_reservations sr
JOIN mosaicoms.customers c ON c.id = sr.customer_id;

-- Process timing analytics (week-over-week taker/fulfillment times)
CREATE OR REPLACE VIEW mosaicoms.v_process_timings AS
SELECT
    week_start_date,
    timing_type,
    avg_time_seconds
FROM mosaicoms.process_timing_analytics;

-- Daily order count trend (wraps existing view)
CREATE OR REPLACE VIEW mosaicoms.v_daily_order_counts AS
SELECT date, order_count
FROM mosaicoms.daily_order_counts;

-- Weekly item request counts (wraps existing view)
CREATE OR REPLACE VIEW mosaicoms.v_weekly_item_requests AS
SELECT week_start, item_name, request_count
FROM mosaicoms.weekly_item_requests_with_names;

-- ---------------------------------------------------------------
-- Read-only user — SELECT on views only, no base table access
-- ---------------------------------------------------------------

CREATE USER IF NOT EXISTS 'oms_ai_agent'@'%' IDENTIFIED BY 'oms_ai_agent_dev';

GRANT SELECT ON mosaicoms.v_order_summary        TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_order_items_detail   TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_items                TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_shower_activity      TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_process_timings      TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_daily_order_counts   TO 'oms_ai_agent'@'%';
GRANT SELECT ON mosaicoms.v_weekly_item_requests TO 'oms_ai_agent'@'%';

FLUSH PRIVILEGES;
