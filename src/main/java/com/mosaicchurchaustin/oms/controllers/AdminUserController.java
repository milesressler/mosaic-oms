package com.mosaicchurchaustin.oms.controllers;

import com.auth0.exception.Auth0Exception;
import com.mosaicchurchaustin.oms.data.request.CreateUserRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateUserRequest;
import com.mosaicchurchaustin.oms.data.response.AdminUserDetailResponse;
import com.mosaicchurchaustin.oms.data.response.AdminUserResponse;
import com.mosaicchurchaustin.oms.services.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    final AdminUserService adminUserService;

    @PostMapping(path = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    Object createUser(
            @RequestBody final CreateUserRequest createUserRequest
            ) throws Auth0Exception {
        return adminUserService.addUser(createUserRequest);
    }

    @ResponseBody
    @GetMapping(path = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<AdminUserResponse> getUsers(final Pageable pageable) throws Auth0Exception {
        return adminUserService.getUsers(pageable);
    }

    @ResponseBody
    @PutMapping(path = "/user/{id}",produces = MediaType.APPLICATION_JSON_VALUE)
    public AdminUserDetailResponse updateUser(@PathVariable("id") final String id,
                                              @RequestBody final UpdateUserRequest request) throws Auth0Exception {
        return adminUserService.updateUser(id,request);
    }


    @ResponseBody
    @PostMapping(path = "/user/{id}/invite",produces = MediaType.APPLICATION_JSON_VALUE)
    public void sendInvite(@PathVariable("id") final String id) throws Auth0Exception {
        adminUserService.sendInvite(id);
    }


    @ResponseBody
    @GetMapping(path = "/user/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public AdminUserDetailResponse getUserDetails(@PathVariable("id") final String id) throws Auth0Exception {
        return adminUserService.getUser(id);
    }

}
