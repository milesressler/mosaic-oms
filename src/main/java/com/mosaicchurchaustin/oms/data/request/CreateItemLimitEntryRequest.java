package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * @param orderUuid optional: the order being filled, whose limit snapshots should be re-checked with this entry
 */
public record CreateItemLimitEntryRequest(
        @NotNull(message = "itemId is required") Long itemId,
        @NotNull(message = "receivedOn is required") LocalDate receivedOn,
        @NotNull(message = "quantity is required") @Min(value = 1, message = "quantity must be at least 1") Integer quantity,
        String notes,
        String orderUuid
) {
}
