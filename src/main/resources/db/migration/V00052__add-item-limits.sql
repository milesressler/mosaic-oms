-- Limited items: an item can only be received N times per period (e.g. 1 coat per year, 2 socks per month).
-- A null limit_quantity means the item is not limited.
ALTER TABLE items
    ADD COLUMN limit_quantity INT NULL COMMENT 'Units a customer may receive per period. Null = not limited.',
    ADD COLUMN limit_period_value INT NULL COMMENT 'Length of the period, in limit_period_unit units',
    ADD COLUMN limit_period_unit VARCHAR(16) NULL COMMENT 'WEEK, MONTH or YEAR',
    ADD COLUMN limit_window VARCHAR(16) NULL COMMENT 'ROLLING (last N units) or CALENDAR (fixed periods that reset)',
    ADD COLUMN limit_period_start_month INT NULL COMMENT 'CALENDAR month/year periods only: month (1-12) the period starts in';

-- Snapshot of the customer limit status at the time the order was taken, so later rule changes
-- do not rewrite what the order taker and filler saw.
ALTER TABLE order_items
    ADD COLUMN limit_snapshot JSON NULL;
