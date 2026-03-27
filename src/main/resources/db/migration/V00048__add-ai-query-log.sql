CREATE TABLE ai_query_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    created         DATETIME(6) NULL,
    updated         DATETIME(6) NULL,
    user_id         BIGINT NOT NULL,
    question        TEXT NOT NULL,
    generated_sql   TEXT NULL,
    result_row_count INT NULL,
    error_message   VARCHAR(1000) NULL,
    CONSTRAINT fk_ai_query_log_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_ai_query_log_user ON ai_query_log (user_id, created);
