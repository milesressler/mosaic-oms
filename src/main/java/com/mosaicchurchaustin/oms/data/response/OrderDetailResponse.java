package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Getter
public class OrderDetailResponse extends OrderResponse {

    public static OrderDetailResponse from(final OrderEntity orderEntity) {


        return OrderDetailResponse.builder()
                .uuid(orderEntity.getUuid())
                .orderStatus(orderEntity.getOrderStatus())
                .customer(
                        OrderResponse.Customer.builder()
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
