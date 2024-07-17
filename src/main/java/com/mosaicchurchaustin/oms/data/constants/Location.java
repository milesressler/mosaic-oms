package com.mosaicchurchaustin.oms.data.constants;

import lombok.Getter;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
public enum Location {
    MOSAIC_NORTH(List.of("4690", "3829", "5671"));

    private final List<String> stopIds;

    Location(final List<String> stopIds) {
        this.stopIds = stopIds;
    }


    public static Optional<Location> fromString(final String input) {
        return Arrays.stream(Location.values())
                .filter(location -> location.name()
                    .equalsIgnoreCase(input))
                .findAny();
    }

    public static Set<String> supportedStops() {
        return Arrays.stream(Location.values())
                .map(Location::getStopIds)
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());
    }
}
