package com.mosaicchurchaustin.oms.data.response;


import com.auth0.json.mgmt.users.User;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.Date;
import java.util.Optional;

@Getter
@SuperBuilder
public class AdminUserResponse {
    private String name;
    private String picture;
    private String email;
    private Long created;
    private String userId;
    private Boolean emailVerified;
    private String nickname;
    private Long lastLogin;

    public static AdminUserResponse from(final User user) {
        return AdminUserResponse.builder()
                .name(user.getName())
                .picture(user.getPicture())
                .created(Optional.ofNullable(user.getCreatedAt()).map(Date::getTime).orElse(null))
                .userId(user.getId())
                .emailVerified(user.isEmailVerified())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .lastLogin(Optional.ofNullable(user.getLastLogin()).map(Date::getTime).orElse(null))
                .build();
    }
}
