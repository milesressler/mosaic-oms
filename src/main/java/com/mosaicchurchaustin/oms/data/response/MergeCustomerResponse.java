package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;

@Builder
public record MergeCustomerResponse(
        String mergedToCustomerUuid,
        long ordersTransferred,
        long showerReservationsTransferred,
        boolean success,
        String message
) {
}