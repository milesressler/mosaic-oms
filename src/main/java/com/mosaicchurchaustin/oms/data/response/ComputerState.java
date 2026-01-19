package com.mosaicchurchaustin.oms.data.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ComputerState {
    @JsonProperty("connected")
    CONNECTED,

    @JsonProperty("disconnected")
    DISCONNECTED
}
