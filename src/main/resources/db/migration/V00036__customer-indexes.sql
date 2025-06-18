-- For fast lookup by UUID
CREATE INDEX idx_customers_uuid ON customers(uuid);

-- For name-based fuzzy searching
CREATE INDEX idx_customers_first_name ON customers(first_name);
CREATE INDEX idx_customers_last_name ON customers(last_name);

-- For SOUNDEX-based phonetic matching (if used frequently and supported by your DB)
-- Note: MySQL doesn't index SOUNDEX directly unless persisted in a column
-- Optional: Add persisted computed columns and index those

-- If you query by flagged status
CREATE INDEX idx_customers_flagged ON customers(flagged);

-- Add generated columns
ALTER TABLE customers
    ADD COLUMN first_name_soundex VARCHAR(12) GENERATED ALWAYS AS (SOUNDEX(first_name)) STORED,
    ADD COLUMN last_name_soundex VARCHAR(12) GENERATED ALWAYS AS (SOUNDEX(last_name)) STORED;

-- Index them
CREATE INDEX idx_customers_first_name_soundex ON customers(first_name_soundex);
CREATE INDEX idx_customers_last_name_soundex ON customers(last_name_soundex);
