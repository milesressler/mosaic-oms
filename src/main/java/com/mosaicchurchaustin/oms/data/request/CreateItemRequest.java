package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@Valid
public record CreateItemRequest(
        Boolean suggestedItem,
        String category,
        @NotBlank(message = "description cannot be blank") String description,
        String placeholder
) {
}
