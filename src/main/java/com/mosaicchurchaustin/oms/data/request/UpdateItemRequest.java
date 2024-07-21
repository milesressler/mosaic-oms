package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;

@Valid
public record UpdateItemRequest(
        Boolean suggestedItem,
        String placeholder
) {
}
