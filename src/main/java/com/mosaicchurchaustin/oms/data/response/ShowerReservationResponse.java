package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.shower.ReservationStatus;
import com.mosaicchurchaustin.oms.data.entity.shower.ShowerReservationEntity;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
public class ShowerReservationResponse implements Serializable {
    private String uuid;
    private CustomerResponse customer;
    private ReservationStatus status;
    private Long queuePosition;
    private Instant startedAt;
    private Instant endTime;
    private Integer showerNumber;
    private String notes;
    public static ShowerReservationResponse from(final ShowerReservationEntity entity) {
        return new ShowerReservationResponse(
                entity.getUuid(),
                CustomerResponse.from(entity.getCustomer()),
                entity.getReservationStatus(),
                entity.getQueuePosition(),
                entity.getStartedAt(),
                entity.getReservationStatus() == ReservationStatus.IN_USE ? entity.getStartedAt().plus(15, ChronoUnit.MINUTES) : entity.getEndedAt(),
                entity.getShowerNumber(),
                entity.getNotes()
        );
    }
}
