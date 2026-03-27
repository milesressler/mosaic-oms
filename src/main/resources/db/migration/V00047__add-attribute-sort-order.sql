-- Add sort_order column to item_attributes to support user-defined display ordering
ALTER TABLE item_attributes
    ADD COLUMN sort_order INT NULL COMMENT 'Display order of this attribute (or group) within the item. Null values sort last.';

-- Initialize sort_order for existing attributes based on the previous default ordering
-- (groupName nulls last, then group_order, then value alphabetically)
UPDATE item_attributes ia
JOIN (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY item_entity_id
               ORDER BY group_name IS NULL, group_name, group_order, value
           ) AS rn
    FROM item_attributes
) ranked ON ia.id = ranked.id
SET ia.sort_order = ranked.rn;
