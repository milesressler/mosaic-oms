-- Create new columns for first, last name id's as bigint
ALTER TABLE customers
DROP COLUMN name;

-- Change column from custermer_id to customer_full_name_id
ALTER TABLE orders
RENAME COLUMN customer_id TO customer_full_name_id;
