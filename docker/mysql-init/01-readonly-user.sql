-- Read-only user for AI query feature
-- This script runs automatically on first container initialization.
-- If the container already exists, run this manually or recreate the volume:
--   docker compose down -v && docker compose up

CREATE USER IF NOT EXISTS 'oms_readonly'@'%' IDENTIFIED BY 'oms_readonly_dev';
GRANT SELECT ON mosaicoms.* TO 'oms_readonly'@'%';
FLUSH PRIVILEGES;
