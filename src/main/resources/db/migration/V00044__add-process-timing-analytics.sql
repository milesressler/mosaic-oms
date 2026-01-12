-- Add process timing analytics table for storing PostHog timing data locally
CREATE TABLE process_timing_analytics (

    id           bigint auto_increment primary key,
    week_start_date DATE NOT NULL COMMENT 'Sunday start date of the week',
    timing_type VARCHAR(50) NOT NULL COMMENT 'ORDER_TAKER_TIME or FULFILLMENT_TIME',
    avg_time_seconds DOUBLE COMMENT 'Average timing in seconds for the week',
    created datetime(6) NULL,
    updated datetime(6) NULL
);

-- Composite index for efficient queries by week and type
CREATE INDEX idx_week_timing ON process_timing_analytics (week_start_date, timing_type);

-- Index for week-based range queries
CREATE INDEX idx_week_start ON process_timing_analytics (week_start_date);
