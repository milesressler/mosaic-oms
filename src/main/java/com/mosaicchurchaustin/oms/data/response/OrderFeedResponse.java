package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderFeedResponse {
    private Long orderId;
    private UserResponse user;
    private OrderStatus orderStatus;
    private Long timestamp;

    public static OrderFeedResponse from(final OrderHistoryEntity orderHistoryEntity) {
        return OrderFeedResponse.builder()
                .orderId(orderHistoryEntity.getOrderEntity().getId())
                .orderStatus(orderHistoryEntity.getOrderStatus())
                .user(UserResponse.from(orderHistoryEntity.getUserEntity()))
                .timestamp(orderHistoryEntity.getTimestamp().toEpochMilli())
                .build();

    }
}
