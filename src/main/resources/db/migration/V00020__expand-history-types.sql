alter table order_history
    modify COLUMN type enum ('STATUS_CHANGE', 'EXPORT');
