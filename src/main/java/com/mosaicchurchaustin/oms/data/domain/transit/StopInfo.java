package com.mosaicchurchaustin.oms.data.domain.transit;
public class StopInfo {
    private String stopId;
    private String stopName;

    public StopInfo(String stopId, String stopName) {
        this.stopId = stopId;
        this.stopName = stopName;
    }

    // Getters
    public String getStopId() {
        return stopId;
    }

    public String getStopName() {
        return stopName;
    }
}
