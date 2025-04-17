package com.mosaicchurchaustin.oms.data.domain.transit;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@Getter
@AllArgsConstructor
public class StopInfo implements Serializable {
    private String stopId;
    private String stopName;
}
