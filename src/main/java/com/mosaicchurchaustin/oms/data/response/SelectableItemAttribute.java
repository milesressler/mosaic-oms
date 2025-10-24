package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.item.ItemAttributeType;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.util.List;

@Getter
@Builder
public class SelectableItemAttribute implements Serializable {
    private String key;
    private String label;
    private Boolean required;
    private ItemAttributeType type;
    private List<ItemAttributeOption> options;
    private String groupName;
    private Integer groupOrder;
}
