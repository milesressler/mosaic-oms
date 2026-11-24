-- Archived events are hidden from the Special Events page by default. Events with orders can't be deleted, so this
-- is how old events are put away.
ALTER TABLE special_events
    ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;
