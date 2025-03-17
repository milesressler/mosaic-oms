package com.mosaicchurchaustin.oms.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    Optional<CustomerEntity> findByFirstNameStringAndLastNameString(String firstNameString, String lastNameString); 
    Optional<CustomerEntity> findByFirstNameString(String firstNameString); 
    Optional<CustomerEntity> findByLastNameString(String lastNameString); 

}
