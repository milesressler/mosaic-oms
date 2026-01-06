package com.mosaicchurchaustin.oms.data.entity.item;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ItemAttributeType {
    SINGLE_SELECT,
    MULTI_SELECT,
    NUMERIC_RANGE,
    TEXT

}
