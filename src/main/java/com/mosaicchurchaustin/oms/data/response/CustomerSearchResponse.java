package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Builder
@Getter
public class CustomerSearchResponse {
    private String firstName;
    private String lastName;
    private String uuid;
    private Boolean flagged;
    private Boolean validWaiver;
    private Instant showerWaiverCompleted;

    public static CustomerSearchResponse from(final CustomerSearchProjection customerSearchProjection) {
        Boolean validWaiver = Optional.ofNullable(customerSearchProjection.getShowerWaiverCompleted())
                .map(waiver -> waiver.compareTo(Instant.now().minus(365, ChronoUnit.DAYS)) > 0)
                .orElse(false);
        return CustomerSearchResponse.builder()
                .firstName(customerSearchProjection.getFirstName())
                .lastName(customerSearchProjection.getLastName())
                .uuid(customerSearchProjection.getUuid())
                .flagged(customerSearchProjection.isFlagged())
                .validWaiver(validWaiver)
                .showerWaiverCompleted(customerSearchProjection.getShowerWaiverCompleted())
                .build();
    }
}
