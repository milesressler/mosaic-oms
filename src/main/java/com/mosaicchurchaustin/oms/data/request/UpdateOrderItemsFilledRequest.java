package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.Map;


@Valid
public record UpdateOrderItemsFilledRequest(
        String orderUuid,
        Map<Long,  @Min(0) @Max(1000) Integer> quantities
){}
