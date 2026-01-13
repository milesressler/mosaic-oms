package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.projections.CustomerSearchProjection;
import com.mosaicchurchaustin.oms.data.request.CreateCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.MergeCustomerRequest;
import com.mosaicchurchaustin.oms.data.request.UpdateCustomerRequest;
import com.mosaicchurchaustin.oms.data.response.MergeCustomerResponse;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.exception.InvalidRequestException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import com.mosaicchurchaustin.oms.repositories.OrderRepository;
import com.mosaicchurchaustin.oms.repositories.ShowerReservationRepository;
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

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ShowerReservationRepository showerReservationRepository;

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

        Optional.ofNullable(request.firstName()).ifPresent(customer::setFirstName);
        Optional.ofNullable(request.lastName()).ifPresent(customer::setLastName);
        Optional.ofNullable(request.flagged()).ifPresent(customer::setFlagged);
        Optional.ofNullable(request.obfuscateName()).ifPresent(customer::setObfuscateName);
        Optional.ofNullable(request.excludeFromMetrics()).ifPresent(customer::setExcludeFromMetrics);
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

    @Transactional
    public MergeCustomerResponse mergeCustomers(final MergeCustomerRequest request) {
        if (request.fromCustomerUuid().equals(request.toCustomerUuid())) {
            throw new InvalidRequestException("Cannot merge customer with itself");
        }

        final CustomerEntity fromCustomer = customerRepository.findByUuid(request.fromCustomerUuid())
                .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, request.fromCustomerUuid()));
        
        final CustomerEntity toCustomer = customerRepository.findByUuid(request.toCustomerUuid())
                .orElseThrow(() -> new EntityNotFoundException(CustomerEntity.ENTITY_TYPE, request.toCustomerUuid()));

        long ordersTransferred = orderRepository.updateCustomerForAllOrders(fromCustomer.getId(), toCustomer.getId());
        
        long showerReservationsTransferred = showerReservationRepository.updateCustomerForAllReservations(fromCustomer.getId(), toCustomer.getId());

        customerRepository.delete(fromCustomer);

        return MergeCustomerResponse.builder()
                .mergedToCustomerUuid(request.toCustomerUuid())
                .ordersTransferred(ordersTransferred)
                .showerReservationsTransferred(showerReservationsTransferred)
                .success(true)
                .message("Successfully merged customer " + fromCustomer.fullName() + " into " + toCustomer.fullName())
                .build();
    }
}
