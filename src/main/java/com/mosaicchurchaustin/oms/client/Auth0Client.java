package com.mosaicchurchaustin.oms.client;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.FieldsFilter;
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

import java.util.List;

@Component
public class Auth0Client {

    @Autowired
    private ManagementAPI managementAPI;
    private final String USER_FIELDS = "user_metadata,identities,email_verified,email,name,picture,created_at,last_login,last_ip,user_id,nickname,username";

    public User getUserById(final String id) throws Auth0Exception {
        return managementAPI.users().get(id, null)
                .execute()
                .getBody();
    }

    public List<User> getsUsersByEmail(final String email) throws Auth0Exception {
        return managementAPI.users()
                        .listByEmail(email, new FieldsFilter().withFields(USER_FIELDS, true))
                        .execute()
                        .getBody();

    }

    public UsersPage getUserPage(final int page, final int size) throws Auth0Exception {
        final UserFilter userFilter = new UserFilter().withPage(page, size)
                .withFields(USER_FIELDS, true);
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
