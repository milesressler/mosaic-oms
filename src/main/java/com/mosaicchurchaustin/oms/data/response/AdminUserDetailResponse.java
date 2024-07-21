package com.mosaicchurchaustin.oms.data.response;


import com.auth0.json.mgmt.roles.RolesPage;
import com.auth0.json.mgmt.users.User;
import com.mosaicchurchaustin.oms.data.constants.MosaicRole;
import com.mosaicchurchaustin.oms.data.entity.order.OrderHistoryEntity;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Optional;

@Getter
@SuperBuilder
public class AdminUserDetailResponse extends AdminUserResponse {
    private List<MosaicRole> roles;
    private List<AdminUserAction> userActions;

    public static AdminUserDetailResponse from(final User user, final RolesPage rolesPage, final List<OrderHistoryEntity> actions) {
        return AdminUserDetailResponse.builder()
                .name(user.getName())
                .picture(user.getPicture())
                .created(user.getCreatedAt().getTime())
                .userId(user.getId())
                .emailVerified(user.isEmailVerified())
                .nickname(user.getNickname())
                .roles(rolesPage.getItems().stream()
                        .map(i -> MosaicRole.fromString(i.getName()))
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .toList())
                .userActions(actions.stream().map(history -> new AdminUserAction(history.getOrderStatus().name(), history.getTimestamp().getTimeInMillis())).toList())
                .build();

    }
}
