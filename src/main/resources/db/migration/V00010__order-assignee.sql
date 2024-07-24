ALTER TABLE orders ADD COLUMN assignee BIGINT NULL;

ALTER TABLE orders
    ADD CONSTRAINT assigneeUserIdConstraint
        FOREIGN KEY (assignee) REFERENCES users (id);
