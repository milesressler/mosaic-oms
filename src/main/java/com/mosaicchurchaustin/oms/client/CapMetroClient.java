package com.mosaicchurchaustin.oms.client;

import com.google.transit.realtime.GtfsRealtime;
import com.mosaicchurchaustin.oms.data.domain.transit.BusStopInfo;
import com.mosaicchurchaustin.oms.exception.ExternalServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CapMetroClient {


    @Value("${cap-metro.api.trip-updates.path}")
    String tripUpdatesPath;

    public List<BusStopInfo> getArrivalsForLocation(final List<String> stops) {
        final GtfsRealtime.FeedMessage feed = fetchAndParseGRTFeed();

        final List<BusStopInfo> busStopInfoList = new LinkedList<>();
        for (GtfsRealtime.FeedEntity entity : feed.getEntityList()) {
            if (entity.hasTripUpdate()) {
                GtfsRealtime.TripUpdate tripUpdate = entity.getTripUpdate();
                if (tripUpdate.getStopTimeUpdateList() != null) {
                    for (GtfsRealtime.TripUpdate.StopTimeUpdate stopTimeUpdate : tripUpdate.getStopTimeUpdateList()) {
                        if (stops.contains(stopTimeUpdate.getStopId())) {
                            final long arrivalTime = stopTimeUpdate.getArrival().getTime() * 1000;
                            final String stopId = stopTimeUpdate.getStopId();
                            final Instant instant = Instant.ofEpochMilli(arrivalTime);
//                            log.info("stop: {}, arrival: {}", LocalDateTime.ofInstant(instant, ZoneId.systemDefault()), stopId);

                            // Check if there's an existing BusStopInfo for this stop
                            final BusStopInfo existingBusStopInfo = busStopInfoList.stream()
                                    .filter(info -> info.getStopId().equals(stopId))
                                    .findFirst()
                                    .orElseGet(() -> {
                                        final BusStopInfo newStop = new BusStopInfo(stopId);
                                        busStopInfoList.add(newStop);
                                        return newStop;
                                    });

                            existingBusStopInfo.setDirection(String.valueOf(tripUpdate.getTrip().getDirectionId()));
                            existingBusStopInfo.setTripId(tripUpdate.getTrip().getTripId());
                            existingBusStopInfo.setRouteId(tripUpdate.getTrip().getRouteId());

                            final Long currentNextArrivalTime = existingBusStopInfo.getNextArrivalTime();

                            if (currentNextArrivalTime == null || arrivalTime < currentNextArrivalTime) {
                                existingBusStopInfo.setNextArrivalTime(arrivalTime);
                            }
                        }
                    }
                }
            }
        }
        return busStopInfoList.stream()
                .sorted(Comparator.comparing(BusStopInfo::getNextArrivalTime))
                .toList();
    }

    // Method to fetch and parse GTFS-realtime feed
    private GtfsRealtime.FeedMessage fetchAndParseGRTFeed() {
        // Implement logic to fetch and parse GRT feed from URL or local file
        // Example: Use a library like Google's protobuf-java to parse the feed
        // Example:
         try {
             final URL url = new URL(tripUpdatesPath);
             return GtfsRealtime.FeedMessage.parseFrom(url.openStream());
         } catch (IOException e) {
             final String message = "Failed to get CapMetro GTFS-RT feed";
             log.error(message, e);
             throw new ExternalServiceException("CapMetro", message, e);
         }
    }
}
