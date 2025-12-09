package com.mosaicchurchaustin.oms.data.response;


import com.auth0.json.mgmt.users.Identity;
import com.auth0.json.mgmt.users.User;
import com.mosaicchurchaustin.oms.data.entity.user.UserSource;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private List<UserSource> sources;

    public static AdminUserResponse from(final User user) {
        final List<UserSource> identities = Optional.ofNullable(user.getIdentities())
                .orElse(List.of())
                .stream()
                .map(Identity::getProvider)
                .map(provider -> provider.equalsIgnoreCase("google-oauth2") ? UserSource.GOOGLE : UserSource.AUTH0)
                .collect(Collectors.toList());
        final Map<String, Object> metadata = user.getUserMetadata();
        final String manualAvatar = metadata != null ? (String) metadata.get("avatar") : null;
        final String googlePicture = metadata != null ? (String) metadata.get("googlePicture") : null;
        final String picture = Optional.ofNullable(manualAvatar)
                .or(() -> Optional.ofNullable(googlePicture))
                .or(() -> Optional.ofNullable(user.getPicture()))
                .orElse(null);

        return AdminUserResponse.builder()
                .name(user.getName())
                .picture(picture)
                .created(Optional.ofNullable(user.getCreatedAt()).map(Date::getTime).orElse(null))
                .userId(user.getId())
                .emailVerified(user.isEmailVerified())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .sources(identities)
                .lastLogin(Optional.ofNullable(user.getLastLogin()).map(Date::getTime).orElse(null))
                .build();
    }
}
