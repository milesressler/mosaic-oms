package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@Valid
public record CreateCustomerRequest(
        @NotBlank String firstName,
        @NotBlank String lastName
){
}
