-- Add the 'category' column to the 'items' table
ALTER TABLE items
    ADD COLUMN category VARCHAR(50);
