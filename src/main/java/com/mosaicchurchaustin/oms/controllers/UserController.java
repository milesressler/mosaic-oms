package com.mosaicchurchaustin.oms.controllers;

import com.mosaicchurchaustin.oms.data.request.SyncUserRequest;
import com.mosaicchurchaustin.oms.data.response.UserResponse;
import com.mosaicchurchaustin.oms.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    final UserService userService;

    @PostMapping(path = "/user/token", produces = MediaType.APPLICATION_JSON_VALUE)
    UserResponse syncUser(
            @RequestHeader("X-Auth0-ID") String idToken
    ) {
        return UserResponse.from(userService.syncUser(idToken));
    }

    @PostMapping(path = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    UserResponse syncUser(@RequestBody SyncUserRequest request) {
        return UserResponse.from(userService.syncUser(request));
    }

}
