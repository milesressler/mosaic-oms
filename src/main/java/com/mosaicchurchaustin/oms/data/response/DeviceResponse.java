package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.DeviceEntity;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Builder
public record DeviceResponse(
        String uuid,
        String name,
        String userAgent,
        OffsetDateTime expiration,
        OffsetDateTime lastAccessed
) {
    public static DeviceResponse from(final DeviceEntity entity) {
        final DeviceResponse.DeviceResponseBuilder builder = DeviceResponse.builder()
                .uuid(entity.getUuid())
                .userAgent(entity.getUserAgent())
                .name(entity.getName());

        Optional.ofNullable(entity.getExpiration()).map(expiration -> expiration.atOffset(ZoneOffset.UTC)).ifPresent(builder::expiration);
        Optional.ofNullable(entity.getLastAccessed()).map(lastAccess -> lastAccess.atOffset(ZoneOffset.UTC)).ifPresent(builder::lastAccessed);

        return builder.build();
    }
}
