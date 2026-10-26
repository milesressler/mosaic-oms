package com.mosaicchurchaustin.oms.data.request;

/**
 * Sets or clears an item's limit. When enabled is false the limit is removed and the other fields are ignored.
 */
public record ItemLimitRequest(
        Boolean enabled,
        Integer quantity,
        Integer periodValue,
        String periodUnit,
        String window,
        Integer periodStartMonth
) {
}
