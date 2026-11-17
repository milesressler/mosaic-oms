package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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


    /** Packing is finished, so fills are final but can still be reversed (e.g. an item was handed back). */
    public static final List<OrderStatus> UNFILLABLE_STATES = Collections.unmodifiableList(Arrays.asList(PACKED, IN_TRANSIT, READY_FOR_CUSTOMER_PICKUP, COMPLETED));

    public static final List<OrderStatus> TERMINAL_STATES = Collections.unmodifiableList(Arrays.asList(CANCELLED, COMPLETED, REJECTED));

    public static OrderStatus from(final String orderStatusString) {
        return Arrays.stream(OrderStatus.values()).filter(orderStatus -> orderStatus.name().equalsIgnoreCase(orderStatusString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("OrderStatus", orderStatusString));
    }

}
