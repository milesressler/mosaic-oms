package com.mosaicchurchaustin.oms.services.bus;

import com.mosaicchurchaustin.oms.client.CapMetroClient;
import com.mosaicchurchaustin.oms.data.constants.Location;
import com.mosaicchurchaustin.oms.data.pojo.transit.BusStopInfo;
import com.mosaicchurchaustin.oms.data.pojo.transit.StopInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class TransitService {

    @Autowired
    CapMetroClient client;

    @Autowired
    Map<String, StopInfo> stopInfoMap;

    @Cacheable("transitData")
    public List<BusStopInfo> getArrivalsFor(final Location location) {
        final List<BusStopInfo> busStopInfoList = client.getArrivalsForLocation(location.getStopIds());
        busStopInfoList.forEach(stop -> stop.setStopInfo(stopInfoMap.get(stop.getStopId())));
        return busStopInfoList;
    }
}
