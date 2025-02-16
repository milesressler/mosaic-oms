package com.mosaicchurchaustin.oms.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mosaicchurchaustin.oms.data.entity.CustomerEntity;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {

    Optional<CustomerEntity> findByName(String name); //TODO: change to first, last name
    Optional<CustomerEntity> findByFirst(String first); 
    Optional<CustomerEntity> findByLast(String last); 

}
