package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminItemResponse {
    private String description;
    private ItemCategory category;
    private String placeholder;
    private Long id;
    private Boolean suggestedItem;
    private Long totalOrdered;
    private Long totalFilled;

    public static AdminItemResponse from(final ItemEntity itemEntity) {
        return AdminItemResponse.builder()
                .description(itemEntity.getDescription())
                .placeholder(itemEntity.getPlaceholder())
                .category(itemEntity.getCategory())
                .suggestedItem(itemEntity.getIsSuggestedItem())
                .id(itemEntity.getId())
                .totalFilled(itemEntity.getOrderItems()
                        .stream()
                        .map(OrderItemEntity::getQuantityFulfilled)
                        .mapToLong(Long::valueOf)
                        .sum()
                )
                .totalOrdered(itemEntity.getOrderItems()
                        .stream()
                        .map(OrderItemEntity::getQuantity)
                        .mapToLong(Long::valueOf)
                        .sum()
                )
                .build();

    }
}
