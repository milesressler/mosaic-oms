package com.mosaicchurchaustin.oms.client;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Auth0Client {

    @Autowired
    private ManagementAPI managementAPI;

    User getUserById(final String id) throws Auth0Exception {
        return managementAPI.users().get(id, null).execute().getBody();
    }

}
