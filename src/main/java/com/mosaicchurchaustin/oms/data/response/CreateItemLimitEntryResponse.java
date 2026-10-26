package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;

import java.util.Map;

/**
 * @param orderItemSnapshots re-checked snapshots keyed by order item id, when an order was given; otherwise empty
 */
public record CreateItemLimitEntryResponse(
        ItemLimitEntryResponse entry,
        Map<Long, ItemLimitStatus> orderItemSnapshots
) {
}
