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
import java.util.stream.Collectors;

@SuperBuilder
@Getter
public class OrderDetailResponse extends OrderResponse {

    private List<OrderItemResponse> items;
    private History lastStatusChange;



    public static OrderDetailResponse from(final OrderEntity orderEntity) {

        return OrderDetailResponse.builder()
                .uuid(orderEntity.getUuid())
                .orderStatus(orderEntity.getOrderStatus())
                .customer(
                        OrderResponse.Customer.builder()
                                .name(orderEntity.getCustomer().getName())
                                .build()
                )
                .lastStatusChange(History.from(orderEntity.getLastStatusChange()))
                .items(orderEntity.getOrderItemList().stream().map(OrderItemResponse::from).collect(Collectors.toList()))
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
        private OrderStatus status;
        private Calendar timestamp;

        public static History from(final OrderHistoryEntity orderHistoryEntity) {
            return History.builder()
                    .status(orderHistoryEntity.getOrderStatus())
                    .user(orderHistoryEntity.getUserEntity().getName())
                    .timestamp(orderHistoryEntity.getTimestamp())
                    .build();

        }
    }
}
