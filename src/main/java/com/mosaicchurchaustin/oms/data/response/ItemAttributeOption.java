package com.mosaicchurchaustin.oms.data.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;

@Getter
@Builder
@AllArgsConstructor
public class ItemAttributeOption implements Serializable {
    private String label;
    private Serializable value;
    private boolean available;
}
