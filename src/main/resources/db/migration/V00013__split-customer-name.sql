-- Create a new column for avatar as VARCHAR
ALTER TABLE customers
    ADD COLUMN first_name VARCHAR(255) NULL,
    ADD COLUMN last_name VARCHAR(255) NULL;



UPDATE customers
SET
    first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = CASE
                    WHEN name LIKE '% %' THEN SUBSTRING(name, LOCATE(' ', name) + 1)
                    ELSE NULL
        END;
