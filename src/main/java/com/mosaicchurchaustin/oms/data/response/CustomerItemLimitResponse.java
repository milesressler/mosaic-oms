package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;

public record CustomerItemLimitResponse(
        Long itemId,
        String description,
        ItemCategory category,
        ItemLimitStatus status
) {
}
