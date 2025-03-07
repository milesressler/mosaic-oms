-- Create new columns for first, last name id's as bigint
ALTER TABLE orders
ADD COLUMN first_id bigint NULL,
ADD COLUMN last_id bigint NULL;