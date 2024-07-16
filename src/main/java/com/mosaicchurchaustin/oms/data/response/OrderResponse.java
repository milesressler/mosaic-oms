package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Calendar;

@Data
@SuperBuilder
@Getter
@AllArgsConstructor
public class OrderResponse {
    private Calendar created;
    private Calendar lastStatusUpdate;
    private Long id;
    private String uuid;
    private Customer customer;
    private OrderStatus orderStatus;

    public static OrderResponse from(final OrderEntity orderEntity) {

        return OrderResponse.builder()
                .uuid(orderEntity.getUuid())
                .id(orderEntity.getId())
                .created(orderEntity.getCreated())
                .lastStatusUpdate(orderEntity.getLastStatusChange().getTimestamp())
                .orderStatus(orderEntity.getOrderStatus())
                .customer(
                        Customer.builder()
                                .name(orderEntity.getCustomer().getName())
                                .build()
                )
                .build();
    }

    @Builder
    @Data
    public static class Customer {
        private String name;
    }
}
