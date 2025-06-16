package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import com.mosaicchurchaustin.oms.data.request.CreateCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateCustomerRequest;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.services.common.CustomerResolver;
import com.mosaicchurchaustin.oms.specifications.CustomerSpecification;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    CustomerResolver customerResolver;

    @Transactional
    public List<CustomerSearchProjection> searchCustomers(final String inputName) {
        final String[] parts = inputName.trim().split("\\s+");  // Split on spaces
        final String firstName = parts.length > 0 ? parts[0] : inputName;
        final String lastName = parts.length > 1 ? parts[1] : inputName;

        return customerRepository.searchCustomers(firstName, lastName, 10);
    }

    @Transactional
    public CustomerEntity getCustomer(final String uuid) {
        return customerRepository.findByUuid(uuid).orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, uuid));
    }

    @Transactional
    public CustomerEntity updateCustomer(final String uuid, final UpdateCustomerRequest request) {
        final var customer = customerRepository.findByUuid(uuid).orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, uuid));

        Optional.ofNullable(request.flagged()).ifPresent(customer::setFlagged);
        Optional.ofNullable(request.showerWaiverSigned()).map(OffsetDateTime::toInstant).ifPresent(customer::setShowerWaiverCompleted);
        return customerRepository.save(customer);
    }

    @Transactional
    public CustomerEntity createCustomer(final CreateCustomerRequest request) {
        return customerResolver.resolveOrCreate(
                "",
                request.firstName(),
                request.lastName());

    }

    @Transactional
    public Page<CustomerEntity> getCustomers(
            final Pageable pageable,
            final String name,
            final Boolean flagged) {
        return customerRepository.findAll(CustomerSpecification.withFilters(name, flagged), pageable);
    }
}
