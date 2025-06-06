package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.OrderEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import com.mosaicchurchaustin.oms.data.entity.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.Optional;

@Data
@SuperBuilder
@Getter
@AllArgsConstructor
public class OrderResponse {
    private Instant created;
    private Instant lastStatusUpdate;
    private Instant postedToGroupMe;
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
                .postedToGroupMe(
                        Optional.ofNullable(orderEntity.getPostedToGroupMe())
                                .map(OrderHistoryEntity::getTimestamp)
                                .orElse(null)
                )
                .orderStatus(orderEntity.getOrderStatus())
                .customer(
                        Customer.builder()
                                .firstName(orderEntity.getCustomer().getFirstName())
                                .lastName(orderEntity.getCustomer().getLastName())
                                .uuid(orderEntity.getCustomer().getUuid())
                                .build()
                )
                .build();
    }

    @Builder
    @Data
    public static class Customer {
        private String firstName;
        private String lastName;
        private String uuid;
    }
}
