package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@SuperBuilder
@Getter
public class OrderDetailResponse extends OrderResponse {

    private List<OrderItemResponse> items;
    private History lastStatusChange;
    private List<History> history;
    private String specialInstructions;
    private UserResponse assignee;


    public static OrderDetailResponse from(final OrderEntity orderEntity) {

        return OrderDetailResponse.builder()
                .uuid(orderEntity.getUuid())
                .id(orderEntity.getId())
                .created(orderEntity.getCreated())
                .orderStatus(orderEntity.getOrderStatus())
                .customer(
                        OrderResponse.Customer.builder()
                                .name(orderEntity.getCustomerFirstName() + orderEntity.getCustomerLastName())
                                .build()
                )
                .assignee(
                        Optional.ofNullable(orderEntity.getAssignee()).map(UserResponse::from).orElse(null)
                )
                .history(orderEntity.getOrderHistoryEntityList().stream().map(History::from).toList())
                .lastStatusChange(History.from(orderEntity.getLastStatusChange()))
                .items(orderEntity.getOrderItemList().stream().map(OrderItemResponse::from).collect(Collectors.toList()))
                .specialInstructions(orderEntity.getSpecialInstructions())
                .build();
    }

    @Builder
    @Data
    public static class Customer {
        private String name;
    }


    @Builder
    @Data
    public static class History {
        private String user;
        private String assigneeExt;
        private OrderStatus status;
        private OrderStatus previousStatus;
        private Calendar timestamp;

        public static History from(final OrderHistoryEntity orderHistoryEntity) {
            return History.builder()
                    .status(orderHistoryEntity.getOrderStatus())
                    .previousStatus(orderHistoryEntity.getPreviousOrderStatus())
                    .user(orderHistoryEntity.getUserEntity().getName())
                    .assigneeExt(orderHistoryEntity.getUserEntity().getExternalId())
                    .timestamp(orderHistoryEntity.getTimestamp())
                    .build();

        }
    }
}
