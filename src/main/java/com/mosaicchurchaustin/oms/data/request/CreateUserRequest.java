package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;


@Valid
public record CreateUserRequest(
        @NotBlank(message = "email cannot be blank")
        @Email
        String email,

        @NotEmpty List<@NotBlank String> roles) {
}
