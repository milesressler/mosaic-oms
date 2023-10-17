package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    final UserService userService;

    @PostMapping(path = "user", produces = MediaType.APPLICATION_JSON_VALUE)
    void syncUser(
            @RequestHeader("X-Auth0-ID") String idToken) {
        userService.syncUser(idToken);
    }

}
