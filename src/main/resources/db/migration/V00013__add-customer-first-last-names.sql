-- Create new columns for firstName, lastName as VARCHAR
ALTER TABLE customers
ADD COLUMN first_name VARCHAR(512) NULL,
ADD COLUMN last_name VARCHAR(512) NULL;