package com.mosaicchurchaustin.oms.data.request;

import com.mosaicchurchaustin.oms.data.entity.order.attributes.AttributeValue;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.Map;

@Valid
public record UpsertOrderItemRequest(Long orderItemId,  // optional: null = new item
                                     Long item,
                                     String notes,
                                     @Min(1) @Max(1000) Integer quantity,
                                     Map<String, AttributeValue> attributes) {}

