package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NotificationSummaryResponse {
    private Long totalUnseen;
    private Long lastSeenId;
    private List<NotificationResponse> notifications;
    private Long nextCursor; // ID of last notification in this page, null if no more pages
    private boolean hasMore;
}