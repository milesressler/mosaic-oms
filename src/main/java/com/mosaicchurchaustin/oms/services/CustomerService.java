package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;
import com.mosaicchurchaustin.oms.data.jpa.CustomerSearchProjection;
import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    CustomerRepository customerRepository;

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
    public Page<CustomerEntity> getCustomers(final Pageable pageable) {
        return customerRepository.findAll(pageable);
    }
}
