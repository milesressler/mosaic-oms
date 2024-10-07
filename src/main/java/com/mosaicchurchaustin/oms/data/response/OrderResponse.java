package com.mosaicchurchaustin.oms.data.response;

import java.util.Calendar;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

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
                                .name(orderEntity.getCustomerFirstName() + orderEntity.getCustomerLastName())
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
