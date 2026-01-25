CREATE TABLE bug_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    
    -- Link to PostHog event
    posthog_event_id VARCHAR(255),
    
    -- Bug details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    
    -- Reporter info
    reporter_user_id BIGINT,
    
    -- Standard audit fields
    created      datetime(6)  null,
    updated      datetime(6)  null,
    
    -- Foreign key to users table
    CONSTRAINT fk_bug_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users (id) ON DELETE SET NULL,
    
    -- Index for common queries
    INDEX idx_bug_reports_status (status),
    INDEX idx_bug_reports_created (created),
    INDEX idx_bug_reports_posthog_event_id (posthog_event_id)
);
