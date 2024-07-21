package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.constants.AuditAction;
import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import lombok.Builder;
import lombok.Getter;
import org.apache.commons.lang3.tuple.Pair;

import java.util.Map;

@Getter
@Builder
public class AuditLogResponse {
    private String userId;
    private Long timestamp;
    private AuditAction auditAction;
    private Map<String, String> added;
    private Map<String, String> removed;
    private Map<String, Pair<String, String>> changed;

    public static AuditLogResponse from(final ItemEntity itemEntity) {
        return AuditLogResponse.builder().build();
//                .description(itemEntity.getDescription())
//                .placeholder(itemEntity.getPlaceholder())
//                .suggestedItem(itemEntity.getIsSuggestedItem())
//                .id(itemEntity.getId())
//                .totalFilled(itemEntity.getOrderItems()
//                        .stream()
//                        .map(OrderItemEntity::getQuantityFulfilled)
//                        .mapToLong(Long::valueOf)
//                        .sum()
//                )
//                .totalOrdered(itemEntity.getOrderItems()
//                        .stream()
//                        .map(OrderItemEntity::getQuantity)
//                        .mapToLong(Long::valueOf)
//                        .sum()
//                )
//                .build();

    }
}
