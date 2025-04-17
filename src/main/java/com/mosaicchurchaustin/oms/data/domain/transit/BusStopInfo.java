package com.mosaicchurchaustin.oms.data.domain.transit;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.io.Serializable;


@Data
@RequiredArgsConstructor
public class BusStopInfo implements Serializable {
    
    final String stopId;
    String direction;
    String routeId;
    String tripId;
    StopInfo stopInfo;
    Long nextArrivalTime;
    Long previousArrivalTime;
}
