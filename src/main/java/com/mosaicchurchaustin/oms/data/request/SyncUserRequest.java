package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.constraints.NotBlank;


public record SyncUserRequest(@NotBlank String name,
                          @NotBlank String username){}
