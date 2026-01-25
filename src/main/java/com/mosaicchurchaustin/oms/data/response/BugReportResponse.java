package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.BugReportEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Builder
@Getter
public class BugReportResponse {
    private String uuid;
    private String posthogEventId;
    private String title;
    private String description;
    private BugReportEntity.BugReportStatus status;
    private UserResponse reporter;
    private Instant created;
    private Instant updated;

    public static BugReportResponse from(final BugReportEntity bugReportEntity) {
        return BugReportResponse.builder()
                .uuid(bugReportEntity.getUuid())
                .posthogEventId(bugReportEntity.getPosthogEventId())
                .title(bugReportEntity.getTitle())
                .description(bugReportEntity.getDescription())
                .status(bugReportEntity.getStatus())
                .reporter(bugReportEntity.getReporter() != null ? UserResponse.from(bugReportEntity.getReporter()) : null)
                .created(bugReportEntity.getCreated())
                .updated(bugReportEntity.getUpdated())
                .build();
    }
}