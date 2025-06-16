CREATE TABLE shower_reservations (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     created DATETIME(6) NULL,
                                     updated DATETIME(6) NULL,
                                     uuid VARCHAR(255) NULL,

                                     customer_id BIGINT NOT NULL,
                                     created_by BIGINT,

                                     started_at DATETIME(6),
                                     ended_at DATETIME(6),

                                     reservation_status VARCHAR(255) NOT NULL,
                                     queue_position BIGINT NOT NULL,
                                     notes TEXT,
                                     shower_number INT,

                                     CONSTRAINT fk_shower_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
                                     CONSTRAINT fk_shower_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);


CREATE INDEX idx_shower_queue_waiting
    ON shower_reservations (reservation_status, queue_position, created);
