-- Step 1: Drop the existing unique constraint on username
ALTER TABLE users
    DROP INDEX username_unique;

-- Step 2: Add a new unique constraint on (source, username)
ALTER TABLE users
    ADD CONSTRAINT unique_source_username UNIQUE (source, username);
