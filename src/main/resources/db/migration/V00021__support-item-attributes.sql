-- Modify items table
ALTER TABLE items
    CHANGE COLUMN is_suggested_item managed TINYINT(1) NOT NULL,
    ADD COLUMN availability VARCHAR(50) NULL;


UPDATE items
SET availability =
        CASE
            WHEN removed = 1 THEN 'UNAVAILABLE'
            ELSE 'AVAILABLE'
            END;

ALTER TABLE items
    DROP COLUMN removed;


-- Create item_attributes table
CREATE TABLE item_attributes (
                                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                           created DATETIME(6) NULL,
                                           updated DATETIME(6) NULL,
                                           item_entity_id BIGINT NOT NULL,
                                           type VARCHAR(50) NOT NULL,
                                           label VARCHAR(255) NOT NULL,
                                           value VARCHAR(255) NOT NULL,
                                           required BIT NOT NULL DEFAULT FALSE,
                                           CONSTRAINT fk_item_attributes_item FOREIGN KEY (item_entity_id) REFERENCES mosaicoms.items (id) ON DELETE CASCADE
);

-- Create item_attribute_options table
CREATE TABLE item_attribute_options (
                                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  created DATETIME(6) NULL,
                                                  updated DATETIME(6) NULL,
                                                  item_attribute_id BIGINT NOT NULL,
                                                  availability VARCHAR(50) NOT NULL,
                                                  label VARCHAR(255) NOT NULL,
                                                  value VARCHAR(255) NOT NULL,
                                                  CONSTRAINT fk_item_attribute_options_attribute FOREIGN KEY (item_attribute_id) REFERENCES mosaicoms.item_attributes (id) ON DELETE CASCADE
);



