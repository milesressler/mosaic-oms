package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;


@Valid
public record UpdateOrderItemRequest(String notes,
                               @Min(1) @Max(1000) Integer quantity){}

