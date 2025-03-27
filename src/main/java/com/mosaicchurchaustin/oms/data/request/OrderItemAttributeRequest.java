package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Valid
public record OrderItemAttributeRequest(@NotBlank String attributeKey,
                                        List<String> selections){}
