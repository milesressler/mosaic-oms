package com.mosaicchurchaustin.oms.data.entity;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Arrays;

@Getter
@AllArgsConstructor
public enum ItemCategory {
    CLOTHING("Apparel items like pants, shirts, jackets, and shoes."),
    HYGIENE("Personal care products like soap, toothpaste, and deodorant."),
    LINENS("Household items like towels, sheets, and blankets."),
    FIRST_AID("Medical supplies like bandages, pain relievers, and ointments."),
    GEAR("Essential equipment like backpacks, tents, and sleeping bags."),
    ACCESSORIES("Additional items like hats, gloves, and ChapStick.");

    @Getter
    private final String description;

    public static ItemCategory from(final String categoryString) {
        return Arrays.stream(ItemCategory.values()).filter(category -> category.name().equalsIgnoreCase(categoryString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("ItemCategory", categoryString));
    }
}

