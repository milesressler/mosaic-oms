package com.mosaicchurchaustin.oms.data.request;


import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Valid
public record ItemAttributeRequest(
        Boolean required,
        @NotBlank String label,
        @NotNull ItemAttributeType attributeType,
        List<@NotBlank String> options,
        String groupName,
        Integer groupOrder
) {
}
