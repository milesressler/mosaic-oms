package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.item.ItemAvailability;
import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class SuggestedItemResponse {
    private String description;
    private String placeholder;
    private ItemCategory category;
    private List<SelectableItemAttribute> attributes;
    private Long id;

    public static SuggestedItemResponse from(final ItemEntity itemEntity) {
        final List<SelectableItemAttribute> attributes = itemEntity.getAttributes() != null ? itemEntity.getAttributes().stream().map(attribute -> SelectableItemAttribute.builder()
                        .type(attribute.getAttributeType())
                        .key(attribute.getValue())
                        .required(attribute.getRequired())
                        .label(attribute.getLabel())
                        .options(
                                attribute.getAttributeOptions().stream().map(option -> ItemAttributeOption.builder()
                                        .label(option.getLabel()).value(option.getValue()).available(ItemAvailability.AVAILABLE == option.getAvailability())
                                        .build()).toList()
                        )
                        .build()).toList() : Collections.emptyList();

        return SuggestedItemResponse.builder()
                .description(itemEntity.getDescription())
                .placeholder(itemEntity.getPlaceholder())
                .category(itemEntity.getCategory())
                .id(itemEntity.getId())
                .attributes(attributes)
                .build();

    }
}
