package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;

public enum OrderStatus {

    PENDING_ACCEPTANCE,
    NEEDS_INFO,
    ACCEPTED,
    PACKING,
    PACKED,
    IN_TRANSIT,
    READY_FOR_CUSTOMER_PICKUP,
    REJECTED,
    CANCELLED,
    COMPLETED;


    public static OrderStatus from(final String orderStatusString) {
        return Arrays.stream(OrderStatus.values()).filter(orderStatus -> orderStatus.name().equalsIgnoreCase(orderStatusString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("OrderStatus", orderStatusString));
    }
}
