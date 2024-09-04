package com.mosaicchurchaustin.oms.services.sockets;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.data.sockets.OrderNotification;
import com.mosaicchurchaustin.oms.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    public OrderNotifier(final SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Method to send a message
    public void notifyOrderCreated(final OrderEntity orderEntity) {


        final OrderNotification orderNotification = OrderNotification.builder()
                .orderId(orderEntity.getId())
                .orderStatus(orderEntity.getOrderStatus())
                .orderUuid(orderEntity.getUuid())
                .build();

        final UserEntity userEntity = userService.currentUser();
        orderNotification.setUserExtId(userEntity.getExternalId());
        orderNotification.setUserName(userEntity.getName());

        orderNotification.setOrder(OrderResponse.from(orderEntity));

        messagingTemplate.convertAndSend("/topic/orders/created", orderNotification);
    }

    public void notifyOrderStatusChanged(final OrderEntity orderEntity, final UserEntity userEntity) {

        final OrderNotification orderNotification = OrderNotification.builder()
                .orderId(orderEntity.getId())
                .orderStatus(orderEntity.getOrderStatus())
                .orderUuid(orderEntity.getUuid())
                .build();

        orderNotification.setUserExtId(userEntity.getExternalId());
        orderNotification.setUserName(userEntity.getName());

        orderNotification.setOrder(OrderResponse.from(orderEntity));

        messagingTemplate.convertAndSend("/topic/orders/status", orderNotification);
    }

    public void notifyOrderAssigneeChanged(final OrderEntity orderEntity) {
        final OrderNotification orderNotification = OrderNotification.builder()
                .orderId(orderEntity.getId())
                .orderStatus(orderEntity.getOrderStatus())
                .orderUuid(orderEntity.getUuid())
                .build();

        if (orderEntity.getAssignee() != null) {
            orderNotification.setAssigneeExtId(orderEntity.getAssignee().getExternalId());
            orderNotification.setAssigneeName(orderEntity.getAssignee().getName());
        }

        final UserEntity userEntity = userService.currentUser();
        orderNotification.setUserExtId(userEntity.getExternalId());
        orderNotification.setUserName(userEntity.getName());

        orderNotification.setOrder(OrderResponse.from(orderEntity));


        messagingTemplate.convertAndSend("/topic/orders/assignee", orderNotification);
    }
}
