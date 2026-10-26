package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitEntryEntity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

public record ItemLimitEntryResponse(
        Long id,
        Long itemId,
        String itemDescription,
        LocalDate receivedOn,
        Integer quantity,
        String notes,
        UserResponse createdBy,
        Instant created
) {
    public static ItemLimitEntryResponse from(final ItemLimitEntryEntity entry) {
        return new ItemLimitEntryResponse(
                entry.getId(),
                entry.getItemEntity().getId(),
                entry.getItemEntity().getDescription(),
                entry.getReceivedOn(),
                entry.getQuantity(),
                entry.getNotes(),
                Optional.ofNullable(entry.getCreatedBy()).map(UserResponse::from).orElse(null),
                entry.getCreated());
    }
}
