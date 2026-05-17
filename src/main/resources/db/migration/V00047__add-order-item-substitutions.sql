CREATE TABLE order_item_substitution (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid          VARCHAR(255) NOT NULL UNIQUE,
    created       DATETIME(6)  NULL,
    updated       DATETIME(6)  NULL,
    order_item_id BIGINT       NOT NULL,
    item_id       BIGINT       NOT NULL,
    attributes    JSON,
    quantity      INT          NOT NULL DEFAULT 1,
    note          TEXT,
    CONSTRAINT fk_ois_order_item FOREIGN KEY (order_item_id) REFERENCES order_items (id),
    CONSTRAINT fk_ois_item       FOREIGN KEY (item_id)       REFERENCES items (id)
);

CREATE INDEX idx_ois_order_item ON order_item_substitution (order_item_id);
