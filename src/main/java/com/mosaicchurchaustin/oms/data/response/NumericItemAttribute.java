package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NumericItemAttribute {
    private String key;
    private String label;
    private ItemAttributeType type;
    private List<ItemAttributeOption> options;

}
