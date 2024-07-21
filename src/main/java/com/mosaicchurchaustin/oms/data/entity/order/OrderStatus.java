package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;

public enum OrderStatus {

    CANCELLED,
    CREATED,
    PENDING_ACCEPTANCE,
    ACCEPTED,
    ASSIGNED,
    FILLED,
    IN_TRANSIT,
    READY_FOR_PICKUP,
    REJECTED,
    DELIVERED;


    public static OrderStatus from(final String orderStatusString) {
        return Arrays.stream(OrderStatus.values()).filter(orderStatus -> orderStatus.name().equalsIgnoreCase(orderStatusString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("OrderStatus", orderStatusString));
    }
}
