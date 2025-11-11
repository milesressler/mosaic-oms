package com.mosaicchurchaustin.oms.services.common;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerResolver {

    private final CustomerRepository customerRepository;

    public CustomerEntity resolveOrCreate(
            final UUID uuid,
            final String firstName,
            final String lastName) {

        return resolveOrCreate(
                Optional.ofNullable(uuid).map(UUID::toString).orElse(null),
                firstName,
                lastName
        );

    }

    public CustomerEntity resolveOrCreate(
        final String uuid,
        final String firstName,
        final String lastName){
        if (StringUtils.isNotBlank(uuid)) {
            return customerRepository.findByUuid(uuid)
                    .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, uuid));
        }

        if (StringUtils.isBlank(firstName) || StringUtils.isBlank(lastName)) {
            throw new InvalidRequestException("Customer first/last name or uuid is required.");
        }

        CustomerEntity customerEntity = CustomerEntity.builder()
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .flagged(false)
                .excludeFromMetrics(false)
                .build();

        return customerRepository.save(customerEntity);
    }
}

