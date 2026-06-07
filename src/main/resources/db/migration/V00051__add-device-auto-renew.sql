ALTER TABLE devices ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: devices with no expiration are auto-renewing; give them a real cookie expiration
UPDATE devices SET auto_renew = TRUE, expiration = DATE_ADD(NOW(), INTERVAL 20 DAY) WHERE expiration IS NULL;
