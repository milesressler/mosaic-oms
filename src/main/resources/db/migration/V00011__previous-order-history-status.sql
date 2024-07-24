-- Create a new column for order_status as VARCHAR
ALTER TABLE order_history
    ADD COLUMN previous_order_status VARCHAR(50) NULL;

ALTER TABLE order_history
    MODIFY COLUMN order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_ACCEPTANCE';

UPDATE order_history SET order_history.order_status = 'PENDING_ACCEPTANCE'
                     where order_history.order_status = 'CREATED';
UPDATE orders SET orders.order_status = 'PENDING_ACCEPTANCE'
                     where orders.order_status = 'CREATED';

UPDATE order_history SET order_history.order_status = 'ACCEPTED'
                     where order_history.order_status = 'ASSIGNED';
UPDATE orders SET orders.order_status = 'ACCEPTED'
                     where orders.order_status = 'ASSIGNED';


