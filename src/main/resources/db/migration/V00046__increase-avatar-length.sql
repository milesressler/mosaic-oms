-- Increase avatar column length to accommodate longer URLs
ALTER TABLE users
    MODIFY COLUMN avatar VARCHAR(4096);
