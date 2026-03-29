package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;

import java.time.OffsetDateTime;

@Valid
public record MergeCustomerRequest(
        String fromCustomerUuid,
        String toCustomerUuid,
        Boolean flagged,
        Boolean obfuscateName,
        Boolean excludeFromMetrics,
        OffsetDateTime showerWaiverSigned,
        String firstName,
        String lastName
) {
}
