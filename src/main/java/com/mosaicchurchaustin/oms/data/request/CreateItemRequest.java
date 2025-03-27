package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Valid
public record CreateItemRequest(
        Boolean managed,
        String category,
        String availability,
        @NotBlank(message = "description cannot be blank") String description,
        String placeholder,
        List<ItemAttributeRequest> attributes
) {
}
