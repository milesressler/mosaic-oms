package com.mosaicchurchaustin.oms.data.request;

import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record CreateSubstitutionRequest(
        @NotNull Long itemId,
        Map<String, AttributeValue> attributes,
        @NotNull @Min(1) @Max(1000) Integer quantity,
        String note
) {}
