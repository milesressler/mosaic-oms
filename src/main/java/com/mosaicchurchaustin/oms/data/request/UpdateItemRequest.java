package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;

import java.util.List;

@Valid
public record UpdateItemRequest(
        String description,
        Boolean managed,
        String category,
        String placeholder,
        String availability,
        List<ItemAttributeRequest> attributes
) {
}
