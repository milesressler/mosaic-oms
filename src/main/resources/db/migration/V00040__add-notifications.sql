-- Create notifications table
CREATE TABLE notifications (
                                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                uuid VARCHAR(255) NOT NULL UNIQUE,
                                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                recipient_user_id BIGINT NOT NULL,
                                notification_type VARCHAR(50) NOT NULL,
                                related_order_id BIGINT,
                                related_order_history_id BIGINT,
                                CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
                                CONSTRAINT fk_notification_order FOREIGN KEY (related_order_id) REFERENCES orders(id),
                                CONSTRAINT fk_notification_history FOREIGN KEY (related_order_history_id) REFERENCES order_history(id)
);

-- Add last notification seen tracking to users
ALTER TABLE users ADD COLUMN last_notification_seen_id BIGINT;

-- Add indexes for efficient notification queries
CREATE INDEX idx_notifications_recipient_created ON notifications (recipient_user_id, created DESC);
CREATE INDEX idx_notifications_type ON notifications (notification_type);
CREATE INDEX idx_notifications_order ON notifications (related_order_id);

-- Add indexes for efficient notification queries based on order_history

-- Index for finding NEEDS_INFO orders by original order taker
-- This covers: order_status = 'NEEDS_INFO' + type = 'STATUS_CHANGE' + timestamp ordering
CREATE INDEX idx_order_history_needs_info_lookup
    ON order_history (order_status, type, timestamp DESC);

-- Index for finding order history by order + user (for original taker identification)
-- This covers: order_entity_id + user_entity_id + type + timestamp ordering
CREATE INDEX idx_order_history_order_user_type
    ON order_history (order_entity_id, user_entity_id, type, timestamp ASC);

-- Index for finding recent status changes by order (for notification cleanup)
-- This covers: order_entity_id + type + timestamp for finding latest status changes
CREATE INDEX idx_order_history_order_status_changes
    ON order_history (order_entity_id, type, timestamp DESC);

