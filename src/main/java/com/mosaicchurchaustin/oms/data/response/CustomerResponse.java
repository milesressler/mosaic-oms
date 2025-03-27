package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import lombok.Builder;
import lombok.Getter;

import java.util.Calendar;
import java.util.Optional;

@Builder
@Getter
public class CustomerResponse {
    private String name;
    private Long created;
    private Long showerWaiverCompleted;
    private String uuid;
    private int visits;

    public static CustomerResponse from(final CustomerEntity customerEntity) {
        return CustomerResponse.builder()
                .name(customerEntity.getName())
                .uuid(customerEntity.getUuid())
                .created(customerEntity.getCreated().getTimeInMillis())
//                .visits(cus)
                .showerWaiverCompleted(Optional.ofNullable(customerEntity.getShowerWaiverCompleted()).map(Calendar::getTimeInMillis).orElse(null))
                .build();
    }
}
