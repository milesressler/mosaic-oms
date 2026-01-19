package com.mosaicchurchaustin.oms.data.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Computer(
        String name,
        ComputerState state
) {
}
