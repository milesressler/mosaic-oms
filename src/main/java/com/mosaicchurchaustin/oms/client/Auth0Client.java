package com.mosaicchurchaustin.oms.client;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.UserFilter;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Auth0Client {

    @Autowired
    private ManagementAPI managementAPI;

    public User getUserById(final String id) throws Auth0Exception {
        return managementAPI.users().get(id, null).execute().getBody();
    }

    public UsersPage getUserPage(final int page, final int size) throws Auth0Exception {
        final UserFilter userFilter = new UserFilter().withPage(page, size);
        return managementAPI.users().list(userFilter)
                .execute().getBody();
    }

}
