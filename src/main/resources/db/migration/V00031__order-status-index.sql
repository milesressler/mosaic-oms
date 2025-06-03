CREATE INDEX idx_orders_status_created
    ON orders (order_status, created ASC);
