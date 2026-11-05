package com.mosaicchurchaustin.oms.data.response;

import java.time.Instant;
import java.util.Map;

/**
 * One line of a customer's item history: either an item on a completed order or a recorded pickup.
 *
 * @param source     ORDER or RECORDED
 * @param receivedAt when the order was completed, or the start of the recorded day
 * @param orderId    ORDER only
 * @param orderItemId ORDER only, used to clear a fill that was given back
 * @param orderUuid  ORDER only
 * @param entry      RECORDED only
 */
public record CustomerItemHistoryResponse(
        Source source,
        Instant receivedAt,
        SuggestedItemResponse item,
        Integer quantityRequested,
        Integer quantityFulfilled,
        Map<String, OrderItemResponse.AttributeDisplay> attributes,
        String notes,
        Long orderId,
        Long orderItemId,
        String orderUuid,
        ItemLimitEntryResponse entry
) {
    public enum Source {
        ORDER,
        RECORDED
    }
}
