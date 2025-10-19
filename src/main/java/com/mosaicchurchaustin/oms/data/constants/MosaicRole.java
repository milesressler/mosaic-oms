package com.mosaicchurchaustin.oms.data.constants;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

public enum MosaicRole {
    ADMIN("Admin"),
    DISTRIBUTOR("Distributor"),
    ORDER_FILLER("Order Filler"),
    RUNNER("Runner"),
    ORDER_TAKER("Order Taker"),
    SHOWERS("Showers"),
    ;

    @Getter
    private final String roleName;

    MosaicRole(final String roleName) {
        this.roleName = roleName;
    }

    public static Optional<MosaicRole> fromString(final String input) {
        return Arrays.stream(MosaicRole.values())
                .filter(role -> role.getRoleName()
                .equalsIgnoreCase(input))
                .findAny();
    }
}
