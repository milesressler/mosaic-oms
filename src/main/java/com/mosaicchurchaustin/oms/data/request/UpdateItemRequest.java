package com.mosaicchurchaustin.oms.data.request;

public record UpdateItemRequest(
        Boolean suggestedItem,
        String placeholder
) {
}
