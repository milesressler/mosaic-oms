package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ItemRequest(@NotBlank String description,
                   String notes,
                   @Min(1) @Max(1000) Integer quantity){}
