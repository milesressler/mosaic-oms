package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;

public enum OrderStatus {

    CREATED,
    FULFILLING,
    AWAITING_DELIVERY,
    DELIVERING,
    COMPLETED;

    public static OrderStatus from(final String orderStatusString) {
        return Arrays.stream(OrderStatus.values()).filter(orderStatus -> orderStatus.name().equalsIgnoreCase(orderStatusString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("OrderStatus", orderStatusString));
    }
}
