package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SuggestedItemResponse {
    private String description;
    private String placeholder;
    private Long id;

    public static SuggestedItemResponse from(final ItemEntity itemEntity) {
        return SuggestedItemResponse.builder()
                .description(itemEntity.getDescription())
                .placeholder(itemEntity.getPlaceholder())
                .id(itemEntity.getId())
                .build();

    }
}
