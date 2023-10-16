package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "customers")
public class CustomerEntity extends BaseUuidEntity {

    @Column(name = "name")
    String name;

    @Column(name = "phone_number")
    String phoneNumber;
}
