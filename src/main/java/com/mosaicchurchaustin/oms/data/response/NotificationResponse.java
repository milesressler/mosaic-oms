package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.notification.NotificationEntity;
import com.mosaicchurchaustin.oms.data.entity.notification.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String uuid;
    private NotificationType type;
    private OrderResponse relatedOrder;
    private Instant created;
    private boolean seen;
    private String message; // Comment from related order history

    public static NotificationResponse from(NotificationEntity notification, Long userLastSeenId) {
        final boolean isSeen = userLastSeenId != null && notification.getId() <= userLastSeenId;
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .uuid(notification.getUuid())
                .type(notification.getType())
                .relatedOrder(notification.getRelatedOrder() != null ? 
                    OrderResponse.from(notification.getRelatedOrder()) : null)
                .created(notification.getCreated())
                .seen(isSeen)
                .message(notification.getRelatedOrderHistory() != null ? 
                    notification.getRelatedOrderHistory().getComment() : null)
                .build();
    }
}