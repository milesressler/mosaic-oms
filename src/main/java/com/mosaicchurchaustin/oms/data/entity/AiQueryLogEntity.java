package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_query_log")
@Getter
@NoArgsConstructor
public class AiQueryLogEntity extends BaseEntity {

    @Override
    public String getEntityType() {
        return "ai_query_log";
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    String question;

    @Column(name = "generated_sql", columnDefinition = "TEXT")
    String generatedSql;

    @Column(name = "result_row_count")
    Integer resultRowCount;

    @Column(name = "error_message", length = 1000)
    String errorMessage;

    @Builder
    public AiQueryLogEntity(final UserEntity user, final String question, final String generatedSql,
                            final Integer resultRowCount, final String errorMessage) {
        this.user = user;
        this.question = question;
        this.generatedSql = generatedSql;
        this.resultRowCount = resultRowCount;
        this.errorMessage = errorMessage;
    }
}
