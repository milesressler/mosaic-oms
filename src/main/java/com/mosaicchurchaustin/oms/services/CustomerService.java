package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.jpa.CustomerSearchProjection;
import com.mosaicchurchaustin.oms.repositories.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
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
}
