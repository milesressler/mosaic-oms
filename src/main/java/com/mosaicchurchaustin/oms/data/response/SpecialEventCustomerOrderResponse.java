package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * An order a guest already has for a special event, so the order taker can spot a second visit.
 */
@Getter
@Builder
public class SpecialEventCustomerOrderResponse {
    private Long id;
    private String uuid;
    private OrderStatus orderStatus;
    private Instant created;
    private List<String> items;

    public static SpecialEventCustomerOrderResponse from(final OrderEntity orderEntity) {
        return SpecialEventCustomerOrderResponse.builder()
                .id(orderEntity.getId())
                .uuid(orderEntity.getUuid())
                .orderStatus(orderEntity.getOrderStatus())
                .created(orderEntity.getCreated())
                .items(orderEntity.getOrderItemList().stream()
                        .map(orderItem -> orderItem.getItemEntity().getDescription())
                        .toList())
                .build();
    }
}
