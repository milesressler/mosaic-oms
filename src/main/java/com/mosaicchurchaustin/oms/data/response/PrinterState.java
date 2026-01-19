package com.mosaicchurchaustin.oms.data.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PrinterState {
    @JsonProperty("online")
    ONLINE,

    @JsonProperty("offline")
    OFFLINE,

    @JsonProperty("unknown")
    UNKNOWN,

    @JsonProperty("error")
    ERROR,

    @JsonProperty("paused")
    PAUSED,

    @JsonProperty("printing")
    PRINTING
}
