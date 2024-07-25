package com.mosaicchurchaustin.oms.data.response;


import com.auth0.json.mgmt.users.User;
import com.mosaicchurchaustin.oms.data.constants.MosaicRole;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Getter
@SuperBuilder
public class AdminUserResponse {
    private String name;
    private String picture;
    private Long created;
    private String userId;
    private Boolean emailVerified;
    private String nickname;
    private Long lastLogin;
    private List<MosaicRole> roles;

    public static AdminUserResponse from(final User user) {
        return AdminUserResponse.builder()
                .name(user.getName())
                .picture(user.getPicture())
                .created(user.getCreatedAt().getTime())
                .userId(user.getId())
                .emailVerified(user.isEmailVerified())
                .nickname(user.getNickname())
                .lastLogin(Optional.ofNullable(user.getLastLogin()).map(Date::getTime).orElse(null))
                .build();
    }
}
