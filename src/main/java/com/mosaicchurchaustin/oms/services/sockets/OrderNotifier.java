package com.mosaicchurchaustin.oms.services.sockets;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderEventType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderExportType;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import com.mosaicchurchaustin.oms.data.response.OrderResponse;
import com.mosaicchurchaustin.oms.data.sockets.BulkOrderNotification;
import com.mosaicchurchaustin.oms.data.sockets.OrderNotification;
import com.mosaicchurchaustin.oms.repositories.OrderHistoryRepository;
import com.mosaicchurchaustin.oms.services.FeaturesService;
import com.mosaicchurchaustin.oms.services.GroupMeService;
import com.mosaicchurchaustin.oms.services.UserService;
import com.mosaicchurchaustin.oms.services.labels.PrintingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

@Component
public class OrderNotifier {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private PrintingService printingService;

    @Autowired
    private GroupMeService groupMeService;

    @Autowired
    private FeaturesService featuresService;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

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

        if (featuresService.getFeaturesConfig().isGroupMeEnabled()) {
            groupMeService.handleOrderCreated(orderEntity);
            final var newHistory = orderHistoryRepository.save(
                OrderHistoryEntity.builder()
                        .orderEntity(orderEntity)
                        .orderStatus(OrderStatus.PENDING_ACCEPTANCE)
                        .previousOrderStatus(OrderStatus.PENDING_ACCEPTANCE)
                        .eventType(OrderEventType.EXPORT)
                        .exportType(OrderExportType.GROUPME)
                        .userEntity(userEntity)
                        .timestamp(Instant.now())
                .build()
            );
            orderEntity.setLastStatusChange(newHistory);
        }
    }

    public void notifyOrderStatusChanged(final List<OrderEntity> orderEntity, final UserEntity userEntity) {
        final BulkOrderNotification bulkOrderNotification = BulkOrderNotification
                .builder().build();


        bulkOrderNotification.setUserExtId(userEntity.getExternalId());
        bulkOrderNotification.setUserName(userEntity.getName());

        bulkOrderNotification.setOrders(
                orderEntity.stream().map(OrderResponse::from).toList()
        );
        messagingTemplate.convertAndSend("/topic/orders/status/bulk", bulkOrderNotification);

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

        var printingActions = Map.<OrderStatus, Consumer<OrderEntity>>of(
                OrderStatus.PACKED, printingService::printPackedLabel,
                OrderStatus.ACCEPTED, printingService::printAcceptedOrderLabel
        );

        Optional.of(orderEntity.getOrderStatus())
                .filter(status -> status == featuresService.getFeaturesConfig().getPrintOnTransitionToStatus())
                .map(printingActions::get)
                .ifPresent(action -> action.accept(orderEntity));
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
