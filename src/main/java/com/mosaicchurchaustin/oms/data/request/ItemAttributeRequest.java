package com.mosaicchurchaustin.oms.data.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Valid
public record ItemAttributeRequest(
        Boolean required,
        @NotBlank String label,
        @Size(min = 2) List<@NotBlank String> options,
        String groupName,
        Integer groupOrder
) {
}
