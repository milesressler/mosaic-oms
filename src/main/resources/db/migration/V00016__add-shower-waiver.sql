-- Create a new column for shower waiver
ALTER TABLE customers
    ADD COLUMN shower_waiver_completed datetime(6) null
;

