package com.mosaicchurchaustin.oms.data.request;

public record MergeCustomerRequest(
        String fromCustomerUuid,
        String toCustomerUuid
) {
}