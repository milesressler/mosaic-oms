package com.mosaicchurchaustin.oms.data.entity;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bug_reports")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BugReportEntity extends BaseUuidEntity {

    @Column(name = "posthog_event_id")
    String posthogEventId;

    @Column(name = "title", nullable = false, length = 500)
    String title;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    BugReportStatus status;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id")
    UserEntity reporter;

    @Override
    public String getEntityType() {
        return "BugReport";
    }

    public enum BugReportStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }
}
