package com.mosaicchurchaustin.oms.data.request.shower;

import jakarta.validation.Valid;

@Valid
public record ShowerReservationRequest(
    String customerUuid,
    String notes
) {
}
