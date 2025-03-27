package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.constants.Location;
import com.mosaicchurchaustin.oms.data.domain.transit.BusStopInfo;
import com.mosaicchurchaustin.oms.services.bus.TransitService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transit")
@RequiredArgsConstructor
public class TransitController {

    @Autowired
    TransitService transitService;

    @ResponseBody
    @GetMapping(path = "/bus/arrivals",  produces = MediaType.APPLICATION_JSON_VALUE)
    public List<BusStopInfo> getBus(@RequestParam("location") String locationParam) {
        final Location location =  Location.fromString(locationParam)
                .orElseThrow(() -> new IllegalArgumentException("invalid location"));
        return transitService.getArrivalsFor(location);
    }
}
