package com.mosaicchurchaustin.oms.data.response;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import lombok.Builder;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Builder
@Getter
public class CustomerResponse {
    private String firstName;
    private String lastName;
    private String displayName;
    private Long created;
    private Long showerWaiverCompleted;
    private String uuid;
    private boolean flagged;

    public static CustomerResponse from(final CustomerEntity customerEntity) {
        return CustomerResponse.builder()
                .firstName(customerEntity.getFirstName())
                .lastName(customerEntity.getLastName())
                .flagged(customerEntity.isFlagged())
                .displayName(Stream.of(customerEntity.getFirstName(), customerEntity.getLastName())
                        .filter(StringUtils::isNotBlank)
                        .collect(Collectors.joining(" ")))
                .uuid(customerEntity.getUuid())
                .created(customerEntity.getCreated().toEpochMilli())
                .showerWaiverCompleted(Optional.ofNullable(customerEntity.getShowerWaiverCompleted()).map(Instant::toEpochMilli).orElse(null))
                .build();
    }
}
