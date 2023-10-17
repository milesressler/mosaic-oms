package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.data.entity.OrderItemEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SuggestedItemResponse {
    private String description;
    private Long id;

    public static SuggestedItemResponse from(final ItemEntity itemEntity) {
        return SuggestedItemResponse.builder()
                .description(itemEntity.getDescription())
                .id(itemEntity.getId())
                .build();

    }
}
