-- Create new columns for firstName, lastName as VARCHAR
ALTER TABLE customers
ADD COLUMN first VARCHAR(512) NULL,
ADD COLUMN last VARCHAR(512) NULL;