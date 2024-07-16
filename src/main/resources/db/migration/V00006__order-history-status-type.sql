-- Create a new column for order_status as VARCHAR
ALTER TABLE order_history
    ADD COLUMN order_status_new VARCHAR(50) NOT NULL DEFAULT 'CREATED';

-- Update the new column with the values from the existing ENUM column
UPDATE order_history
SET order_status_new = CASE order_status
                           WHEN 'AWAITING_DELIVERY' THEN 'AWAITING_DELIVERY'
                           WHEN 'COMPLETED' THEN 'COMPLETED'
                           WHEN 'CREATED' THEN 'CREATED'
                           WHEN 'DELIVERING' THEN 'DELIVERING'
                           WHEN 'FULFILLING' THEN 'FULFILLING'
                           ELSE 'CREATED' -- Default value if necessary
    END;

-- Drop the old ENUM column after updating
ALTER TABLE order_history
    DROP COLUMN order_status;

-- Rename the new column to match the old column name
ALTER TABLE order_history
    CHANGE COLUMN order_status_new order_status VARCHAR(50) NOT NULL;
