package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.notification.NotificationEntity;
import com.mosaicchurchaustin.oms.data.entity.notification.NotificationType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.response.NotificationResponse;
import com.mosaicchurchaustin.oms.data.response.NotificationSummaryResponse;
import com.mosaicchurchaustin.oms.repositories.NotificationRepository;
import com.mosaicchurchaustin.oms.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public NotificationEntity createNotification(UserEntity recipient, NotificationType type, OrderEntity relatedOrder, OrderHistoryEntity relatedOrderHistory) {
        final NotificationEntity notification = NotificationEntity.builder()
                .recipient(recipient)
                .type(type)
                .relatedOrder(relatedOrder)
                .relatedOrderHistory(relatedOrderHistory)
                .build();
        
        return notificationRepository.save(notification);
    }

    public NotificationSummaryResponse getNotificationSummaryForCurrentUser(Long cursor, Integer pageSize) {
        final UserEntity currentUser = userService.currentUser();
        final Long lastSeenId = currentUser.getLastNotificationSeenId();
        final int limit = pageSize != null ? pageSize : 20;
        
        // Get notifications with pagination
        final List<NotificationEntity> notifications;
        if (cursor == null) {
            // First page
            notifications = notificationRepository.findByRecipientIdOrderByCreatedDescWithLimit(currentUser.getId(), limit + 1);
        } else {
            // Subsequent pages
            notifications = notificationRepository.findByRecipientIdWithCursor(currentUser.getId(), cursor, limit + 1);
        }
        
        // Calculate pagination info
        final boolean hasMore = notifications.size() > limit;
        final List<NotificationEntity> pageNotifications = hasMore ? 
            notifications.subList(0, limit) : notifications;
        final Long nextCursor = hasMore ? pageNotifications.get(pageNotifications.size() - 1).getId() : null;
        
        // Get total unseen count (only on first page to avoid extra queries)
        final Long totalUnseen = cursor == null ? 
            (lastSeenId == null ? 
                notificationRepository.countByRecipientId(currentUser.getId()) :
                notificationRepository.countByRecipientIdAndIdGreaterThan(currentUser.getId(), lastSeenId)
            ) : null;
            
        final List<NotificationResponse> notificationResponses = pageNotifications.stream()
                .map(notification -> NotificationResponse.from(notification, lastSeenId))
                .toList();
        
        return NotificationSummaryResponse.builder()
                .totalUnseen(totalUnseen)
                .lastSeenId(lastSeenId)
                .notifications(notificationResponses)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }

    @Transactional
    public void markAllNotificationsAsSeenForCurrentUser() {
        final UserEntity currentUser = userService.currentUser();
        final Optional<NotificationEntity> mostRecent = notificationRepository.findFirstByRecipientIdOrderByCreatedDesc(currentUser.getId());
        mostRecent.ifPresent((it) -> {
            final Long latestNotificationId = it.getId();
            currentUser.setLastNotificationSeenId(latestNotificationId);
            userRepository.save(currentUser);
        });
    }
}
