package com.mosaicchurchaustin.oms.data.pojo.transit;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class BusStopInfo {
    final String stopId;
    String direction;
    String routeId;
    String tripId;
    StopInfo stopInfo;
    Long nextArrivalTime;
    Long previousArrivalTime;
}
