package com.mosaicchurchaustin.oms.data.request.shower;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdatePositionRequest(
        @NotNull
        @Min(1)
        Long newPosition
) {}
