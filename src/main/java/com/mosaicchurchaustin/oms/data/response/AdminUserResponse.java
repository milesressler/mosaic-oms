package com.mosaicchurchaustin.oms.data.response;


import com.auth0.json.mgmt.users.User;
import com.mosaicchurchaustin.oms.data.constants.MosaicRole;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@SuperBuilder
public class AdminUserResponse {
    private String name;
    private String picture;
    private Long created;
    private String userId;
    private Boolean emailVerified;
    private String nickname;
    private List<MosaicRole> roles;

    public static AdminUserResponse from(final User user) {
        return AdminUserResponse.builder()
                .name(user.getName())
                .picture(user.getPicture())
                .created(user.getCreatedAt().getTime())
                .userId(user.getId())
                .emailVerified(user.isEmailVerified())
                .nickname(user.getNickname())
                .build();

    }
}
