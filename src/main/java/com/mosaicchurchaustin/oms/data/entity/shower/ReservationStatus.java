package com.mosaicchurchaustin.oms.data.entity.shower;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum ReservationStatus {

    WAITING,
    READY,
    IN_USE,
    COMPLETED,
    CANCELLED;


    public static final List<ReservationStatus> TERMINAL_STATES = Collections.unmodifiableList(Arrays.asList(CANCELLED, COMPLETED));

    public static ReservationStatus from(final String statusString) {
        return Arrays.stream(ReservationStatus.values()).filter(reservationStatus -> reservationStatus.name().equalsIgnoreCase(statusString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("ReservationStatus", statusString));
    }

}
