package com.mosaicchurchaustin.oms.client;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.PageFilter;
import com.auth0.client.mgmt.filter.RolesFilter;
import com.auth0.client.mgmt.filter.UserFilter;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.roles.Role;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Auth0Client {

    @Autowired
    private ManagementAPI managementAPI;

    public User getUserById(final String id) throws Auth0Exception {
        return managementAPI.users().get(id, null)
                .execute()
                .getBody();
    }

    public UsersPage getUserPage(final int page, final int size) throws Auth0Exception {
        final UserFilter userFilter = new UserFilter().withPage(page, size);
        return managementAPI.users().list(userFilter)
                .execute()
                .getBody();
    }

    public UsersPage getUserPageWithRole(final String roleName, final int page, final int size) throws Auth0Exception {
        final var role = getRole(roleName);
        return managementAPI.roles()
                .listUsers(role.getId(), new PageFilter().withPage(page, size))
                .execute()
                .getBody();
    }

    private Role getRole(final String roleName) throws Auth0Exception {
        return managementAPI.roles().list(new RolesFilter().withName(roleName)).execute().getBody().getItems().stream()
                .findFirst().orElseThrow(() -> new InvalidRequestException("No such role: " + roleName));
    }


}
