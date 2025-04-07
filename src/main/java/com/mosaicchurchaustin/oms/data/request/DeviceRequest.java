package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;

import java.time.OffsetDateTime;

@Valid
public record DeviceRequest(
        @NotBlank(message = "Device name is required") String name,
        @FutureOrPresent(message = "Expiration date must be in the future or present")
        OffsetDateTime expireAt) {
}
