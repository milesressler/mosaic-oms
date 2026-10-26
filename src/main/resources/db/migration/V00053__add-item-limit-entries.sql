-- Pickups of limited items recorded by hand (e.g. synced from an old paper/spreadsheet log).
-- Counted by item limits the same way as items on completed orders.
CREATE TABLE item_limit_entries (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    created        DATETIME(6) NULL,
    updated        DATETIME(6) NULL,
    customer_id    BIGINT       NOT NULL,
    item_entity_id BIGINT       NOT NULL,
    received_on    DATE         NOT NULL COMMENT 'Local (America/Chicago) date the customer received the item',
    quantity       INT          NOT NULL,
    notes          VARCHAR(255) NULL,
    created_by     BIGINT       NULL,
    CONSTRAINT fk_item_limit_entry_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_item_limit_entry_item FOREIGN KEY (item_entity_id) REFERENCES items (id),
    CONSTRAINT fk_item_limit_entry_created_by FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE INDEX idx_item_limit_entries_customer_item ON item_limit_entries (customer_id, item_entity_id);
