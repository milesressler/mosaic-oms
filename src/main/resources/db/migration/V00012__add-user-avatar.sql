-- Create a new column for avatar as VARCHAR
ALTER TABLE users
    ADD COLUMN avatar VARCHAR(512) NULL;

