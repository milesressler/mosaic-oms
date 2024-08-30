package com.mosaicchurchaustin.oms.data.request;

import jakarta.validation.Valid;

import java.util.List;

@Valid
public record UpdateOrderStatusBulkRequest (
    List<String> orderUuids
){}
