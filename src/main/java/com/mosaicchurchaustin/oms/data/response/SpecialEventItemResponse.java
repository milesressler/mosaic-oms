package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Getter;

/**
 * @param quantityAvailable stock for the event, or null for no limit
 * @param claimed           units on the event's orders that are not cancelled or rejected
 * @param remaining         stock left, or null for no limit; never negative
 */
@Getter
@Builder
public class SpecialEventItemResponse {
    private SuggestedItemResponse item;
    private Integer quantityAvailable;
    private long claimed;
    private Integer remaining;
}
