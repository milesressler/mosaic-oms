package com.mosaicchurchaustin.oms.data.entity.order;

import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitRule;
import lombok.Builder;

import java.io.Serializable;
import java.time.Instant;

/**
 * A customer's standing against a limited item's rule at a moment in time.
 * Returned live for the order form, and stored on order items as a snapshot when the order is taken.
 *
 * @param rule              the rule as it was when evaluated
 * @param evaluatedAt       the moment this status describes
 * @param periodStart       start of the period being counted (rolling: evaluatedAt minus the period length)
 * @param receivedInPeriod  units received on completed orders within the period
 * @param remaining         units still allowed in the period, never negative
 * @param lastReceivedAt    most recent completed order containing this item, at any time
 * @param nextEligibleAt    when at least one more unit is allowed, or null if one is allowed now
 * @param requestedQuantity snapshot only: units of this item on the order
 * @param overLimit         snapshot only: whether the order put the customer over the limit
 */
@Builder
public record ItemLimitStatus(
        ItemLimitRule rule,
        Instant evaluatedAt,
        Instant periodStart,
        int receivedInPeriod,
        int remaining,
        Instant lastReceivedAt,
        Instant nextEligibleAt,
        Integer requestedQuantity,
        Boolean overLimit
) implements Serializable {
}
