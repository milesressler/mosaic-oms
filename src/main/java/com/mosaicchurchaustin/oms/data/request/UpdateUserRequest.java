package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;


@Valid
public record UpdateUserRequest(

        List<@NotBlank String> addRoles,
        List<@NotBlank String> setRoles,
        List<@NotBlank String> removeRoles) {
}
