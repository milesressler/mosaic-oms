package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * An order taken on a special event page: one of each picked item.
 *
 * @param allowAdditional the order taker confirmed this guest may get another order for the event
 */
public record CreateSpecialEventOrderRequest(
        UUID customerUuid,
        String customerFirstName,
        String customerLastName,
        Boolean customerNameObfuscated,
        @NotEmpty(message = "Pick at least one item") List<Long> itemIds,
        Boolean allowAdditional
) {
}
