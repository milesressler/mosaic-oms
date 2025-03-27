package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CustomerSearchResponse {
    private String name;
    private String uuid;

    public static CustomerSearchResponse from(final CustomerSearchProjection customerSearchProjection) {
        return CustomerSearchResponse.builder()
                .name(customerSearchProjection.getName())
                .uuid(customerSearchProjection.getUuid())
                .build();
    }
}
