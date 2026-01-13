package com.mosaicchurchaustin.oms.utils;

import java.time.LocalDate;

/**
 * Utility class for date-related operations
 */
public final class DateUtils {

    private DateUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Gets the start of a specific date's week (Sunday)
     * 
     * @param date the date to find the week start for
     * @return the Sunday that starts the week containing the given date
     */
    public static LocalDate getSundayStartForDate(final LocalDate date) {
        final int daysFromSunday = date.getDayOfWeek().getValue() % 7;
        return date.minusDays(daysFromSunday);
    }
}