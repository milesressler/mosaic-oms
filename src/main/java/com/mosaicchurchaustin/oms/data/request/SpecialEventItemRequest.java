package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * @param quantityAvailable stock for the event; null means no limit
 */
public record SpecialEventItemRequest(
        @NotNull(message = "itemId is required") Long itemId,
        @Min(value = 0, message = "quantityAvailable can't be negative") Integer quantityAvailable
) {
}
