package com.mosaicchurchaustin.oms.data.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PrinterResponse(
        Integer id,
        String name,
        String description,
        PrinterState state,
        Computer computer,

        @JsonProperty("default")
        Boolean isDefault
) {
}
