-- Create new columns for firstName, lastName as VARCHAR
ALTER TABLE customers
ADD COLUMN firstName VARCHAR(512) NULL,
ADD COLUMN lastName VARCHAR(512) NULL;

UPDATE customers
SET firstName = IF(INSTR(name, ' ') = 0, name, SUBSTRING_INDEX(name, ' ', 1)),
    lastName = IF(INSTR(name, ' ') = 0, NULL, SUBSTRING_INDEX(name, ' ', -1))
WHERE name IS NOT NULL;
