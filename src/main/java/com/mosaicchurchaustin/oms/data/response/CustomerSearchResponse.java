package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CustomerSearchResponse {
    private String firstName;
    private String lastName;
    private String uuid;

    public static CustomerSearchResponse from(final CustomerSearchProjection customerSearchProjection) {
        return CustomerSearchResponse.builder()
                .firstName(customerSearchProjection.getFirstName())
                .lastName(customerSearchProjection.getLastName())
                .uuid(customerSearchProjection.getUuid())
                .build();
    }
}
