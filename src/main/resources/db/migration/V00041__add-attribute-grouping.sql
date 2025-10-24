-- Add grouping fields to item_attributes table
ALTER TABLE item_attributes
    ADD COLUMN group_name VARCHAR(255) NULL COMMENT 'Optional group name to visually group related attributes together (e.g., "Size")',
    ADD COLUMN group_order INT NULL COMMENT 'Order within the group (1, 2, 3...). Only meaningful when group_name is set.';

-- Add index for efficient querying by group
CREATE INDEX idx_item_attributes_group ON item_attributes (item_entity_id, group_name, group_order);