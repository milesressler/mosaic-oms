package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminItemResponse {
    private String description;
    private String placeholder;
    private Long id;
    private Boolean suggestedItem;

    public static AdminItemResponse from(final ItemEntity itemEntity) {
        return AdminItemResponse.builder()
                .description(itemEntity.getDescription())
                .placeholder(itemEntity.getPlaceholder())
                .suggestedItem(itemEntity.getIsSuggestedItem())
                .id(itemEntity.getId())
                .build();

    }
}
