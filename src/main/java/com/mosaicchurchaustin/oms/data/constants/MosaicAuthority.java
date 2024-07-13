package com.mosaicchurchaustin.oms.data.constants;

import java.util.Arrays;
import java.util.Optional;

public enum MosaicAuthority {
    ADMIN("admin");

    private final String authority;

    MosaicAuthority(final String authority) {
        this.authority = authority;
    }

    public String getAuthority() {
        return authority;
    }

    public static Optional<MosaicAuthority> fromString(final String permissionString) {
        return Arrays.stream(MosaicAuthority.values())
                .filter(authority -> authority.getAuthority()
                .equalsIgnoreCase(permissionString))
                .findAny();
    }
}
