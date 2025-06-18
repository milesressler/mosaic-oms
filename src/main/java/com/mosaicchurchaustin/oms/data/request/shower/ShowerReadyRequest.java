package com.mosaicchurchaustin.oms.data.request.shower;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public record ShowerReadyRequest(
        @NotNull
        @Min(1)
        @Max(2)
        Integer showerNumber
) {}

