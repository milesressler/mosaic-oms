package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.response.UserResponse;
import com.mosaicchurchaustin.oms.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    final UserService userService;

    @PostMapping(path = "/token", produces = MediaType.APPLICATION_JSON_VALUE)
    UserResponse syncUser(
            @RequestHeader("X-Auth0-ID") final String idToken
    ) {
        return UserResponse.from(userService.syncUser(idToken));
    }

}
