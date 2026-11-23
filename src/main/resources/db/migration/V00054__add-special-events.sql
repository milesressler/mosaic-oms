-- Special events (e.g. a Christmas giveaway): a named set of regular catalog items that order takers
-- pick from on a dedicated page. Orders taken for an event skip filling and go straight to pickup.
CREATE TABLE special_events (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid            VARCHAR(255) NOT NULL,
    created         DATETIME(6)  NULL,
    updated         DATETIME(6)  NULL,
    name            VARCHAR(255) NOT NULL,
    event_date      DATE         NULL COMMENT 'Informational only',
    items_per_guest INT          NOT NULL DEFAULT 1 COMMENT 'How many different items a guest may pick',
    UNIQUE KEY uk_special_events_uuid (uuid)
);

-- Items offered at an event, with optional stock for that event only.
-- Stock is counted from orders for the event that are not cancelled or rejected.
CREATE TABLE special_event_items (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    created            DATETIME(6) NULL,
    updated            DATETIME(6) NULL,
    special_event_id   BIGINT      NOT NULL,
    item_id            BIGINT      NOT NULL,
    quantity_available INT         NULL COMMENT 'Stock for this event. Null = no stock limit.',
    sort_order         INT         NULL,
    CONSTRAINT fk_special_event_items_event FOREIGN KEY (special_event_id) REFERENCES special_events (id),
    CONSTRAINT fk_special_event_items_item FOREIGN KEY (item_id) REFERENCES items (id),
    UNIQUE KEY uk_special_event_items_event_item (special_event_id, item_id)
);

ALTER TABLE orders
    ADD COLUMN special_event_id BIGINT NULL COMMENT 'Set when the order was taken for a special event',
    ADD CONSTRAINT fk_orders_special_event FOREIGN KEY (special_event_id) REFERENCES special_events (id);

CREATE INDEX idx_orders_special_event_status ON orders (special_event_id, order_status);

ALTER TABLE features
    ADD COLUMN active_special_event_id BIGINT NULL COMMENT 'Event shown to order takers. Null = no event running.',
    ADD CONSTRAINT fk_features_active_special_event FOREIGN KEY (active_special_event_id) REFERENCES special_events (id);
