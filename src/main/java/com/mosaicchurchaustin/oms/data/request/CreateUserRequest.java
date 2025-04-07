package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;


@Valid
public record CreateUserRequest(
        @NotBlank(message = "email cannot be blank")
        @Email
        String email,
        @NotBlank(message = "name cannot be blank")
        String name,

        List<@NotBlank String> roles) {
}
