package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum ItemAvailability {
    AVAILABLE,
    UNAVAILABLE,
    DISCONTINUED;

    public static ItemAvailability from(final String availabilityString) {
        return Arrays.stream(ItemAvailability.values()).filter(availability -> availability.name().equalsIgnoreCase(availabilityString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("ItemAvailability", availabilityString));
    }
}
