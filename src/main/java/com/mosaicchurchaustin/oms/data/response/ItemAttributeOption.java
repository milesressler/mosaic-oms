package com.mosaicchurchaustin.oms.data.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ItemAttributeOption {
    private String label;
    private Object value;
    private boolean available;
}
