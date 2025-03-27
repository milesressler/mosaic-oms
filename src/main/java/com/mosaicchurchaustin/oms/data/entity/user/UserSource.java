package com.mosaicchurchaustin.oms.data.entity.user;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

public enum UserSource {
    GOOGLE(1),
    AUTH0(2),
    SYSTEM(3);

    @Getter
    final Integer id;

    UserSource(final Integer id) {
        this.id = id;
    }

    public static Optional<UserSource> from(final Integer id) {
        if (id == null) {
            return Optional.empty();
        }
        return Arrays.stream(UserSource.values())
                .filter(userSource -> userSource.getId().equals(id))
                .findAny();
    }
}
