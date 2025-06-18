package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;

import java.time.Instant;
import java.util.List;

/**
 * DTO representing current stall statuses and the waiting queue.
 */
public record ShowerQueueResponse(
        List<StallStatus> stalls,
        List<QueueEntryResponse> queue
) {

    /**
     * Represents the status of a single shower stall.
     */
    public static record StallStatus(
            int stallNumber,
            ReservationStatus status,
            ShowerReservationResponse reservation,
            Instant availableAt
    ) {}

    /**
     * Represents a single entry in the waiting queue.
     */
    public static record QueueEntryResponse(
            String uuid,
            CustomerResponse customer,
            long queuePosition,
            Instant estimatedStart,
            boolean readyNow
    ) {}
}

