package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Optional;

@Builder
@Getter
public class CustomerResponse {
    private String firstName;
    private String lastName;
    private Long created;
    private Long showerWaiverCompleted;
    private String uuid;
    private int visits;

    public static CustomerResponse from(final CustomerEntity customerEntity) {
        return CustomerResponse.builder()
                .firstName(customerEntity.getFirstName())
                .lastName(customerEntity.getLastName())
                .uuid(customerEntity.getUuid())
                .created(customerEntity.getCreated().toEpochMilli())
//                .visits(cus)
                .showerWaiverCompleted(Optional.ofNullable(customerEntity.getShowerWaiverCompleted()).map(Instant::toEpochMilli).orElse(null))
                .build();
    }
}
