package com.mosaicchurchaustin.oms.data.entity.notification;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
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
import lombok.ToString;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEntity extends BaseUuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_user_id")
    private UserEntity recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType type;

    @ManyToOne
    @JoinColumn(name = "related_order_id")
    private OrderEntity relatedOrder;

    @ManyToOne
    @JoinColumn(name = "related_order_history_id")
    private OrderHistoryEntity relatedOrderHistory;

    @Override
    public String getEntityType() {
        return "Notification";
    }
}
