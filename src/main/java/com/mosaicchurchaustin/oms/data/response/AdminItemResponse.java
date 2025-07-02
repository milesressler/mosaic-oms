package com.mosaicchurchaustin.oms.data.response;


import com.mosaicchurchaustin.oms.data.entity.item.ItemAvailability;
import com.mosaicchurchaustin.oms.data.entity.item.ItemCategory;
import com.mosaicchurchaustin.oms.data.entity.item.ItemEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminItemResponse {
    private String description;
    private ItemCategory category;
    private ItemAvailability availability;
    private String placeholder;
    private Long id;
    private Boolean managed;
    private List<SelectableItemAttribute> attributes;

    public static AdminItemResponse from(final ItemEntity itemEntity) {
        final var attributes = itemEntity.getAttributes().stream().map(attribute -> SelectableItemAttribute.builder()
                .type(attribute.getAttributeType())
                .key(attribute.getValue())
                .label(attribute.getLabel())
                .required(attribute.getRequired())
                .options(
                        attribute.getAttributeOptions().stream().map(option -> ItemAttributeOption.builder()
                                .label(option.getLabel()).value(option.getValue()).available(ItemAvailability.AVAILABLE == option.getAvailability())
                                .build()).toList()
                )
                .build()).toList();
        return AdminItemResponse.builder()
                .description(itemEntity.getDescription())
                .placeholder(itemEntity.getPlaceholder())
                .category(itemEntity.getCategory())
                .availability(itemEntity.getAvailability())
                .managed(itemEntity.isManaged())
                .id(itemEntity.getId())
                .attributes(attributes)
                .build();

    }
}
