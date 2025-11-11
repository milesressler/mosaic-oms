package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;

import java.time.OffsetDateTime;

@Valid
public record UpdateCustomerRequest(
        Boolean flagged,
        Boolean obfuscateName,
        Boolean excludeFromMetrics,
        OffsetDateTime showerWaiverSigned,
        String firstName,
        String lastName
){
}
