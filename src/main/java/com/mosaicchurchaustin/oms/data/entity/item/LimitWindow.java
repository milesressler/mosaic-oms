package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;

public enum LimitWindow {
    /** Counts what was received in the last N units, e.g. the last 30 days */
    ROLLING,
    /** Counts what was received in the current fixed period, e.g. this calendar month or this winter season */
    CALENDAR;

    public static LimitWindow from(final String windowString) {
        return Arrays.stream(LimitWindow.values()).filter(window -> window.name().equalsIgnoreCase(windowString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("LimitWindow", windowString));
    }
}
