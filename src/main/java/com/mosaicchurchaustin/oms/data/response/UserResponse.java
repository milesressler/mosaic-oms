package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.user.UserEntity;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class UserResponse {
    private String name;
    private String uuid;
    private String externalId;

    public static UserResponse from(final UserEntity userEntity) {
        return UserResponse.builder()
                .name(userEntity.getName())
                .uuid(userEntity.getUuid())
                .externalId(userEntity.getExternalId())
                .build();
    }
}
