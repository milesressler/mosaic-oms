package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

/**
 * Creates or replaces a special event. Items are listed in the order order takers should see them.
 */
public record SpecialEventRequest(
        @NotBlank(message = "name is required") String name,
        LocalDate eventDate,
        @NotNull(message = "itemsPerGuest is required") @Min(value = 1, message = "itemsPerGuest must be at least 1") Integer itemsPerGuest,
        @NotNull(message = "items is required") List<@Valid SpecialEventItemRequest> items
) {
}
