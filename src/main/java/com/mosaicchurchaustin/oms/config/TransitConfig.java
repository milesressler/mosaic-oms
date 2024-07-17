package com.mosaicchurchaustin.oms.config;

import com.mosaicchurchaustin.oms.data.constants.Location;
import com.mosaicchurchaustin.oms.data.pojo.transit.StopInfo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class TransitConfig {
    @Bean
    public Map<String, StopInfo> stopIdToInfoMap() throws IOException {
        final Set<String> supportedStops = Location.supportedStops(); // Assuming Location.supportedStops() returns supported stop IDs

        // Read stops.txt and filter based on supported stops
        try (final InputStream inputStream = new ClassPathResource("transit/stops.txt").getInputStream();
             final BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            // Skip header
            reader.readLine();

            // Create a map of stop_id to StopInfo for supported stops
            final Map<String, StopInfo> stopIdToInfoMap = reader.lines()
                    .map(line -> line.split(","))
                    .filter(tokens -> supportedStops.contains(tokens[0]))
                    .collect(Collectors.toMap(tokens -> tokens[0], tokens -> new StopInfo(tokens[0], tokens[2])));

            return stopIdToInfoMap;
        }
    }
}
