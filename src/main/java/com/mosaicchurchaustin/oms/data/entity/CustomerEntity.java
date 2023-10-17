package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CustomerEntity extends BaseUuidEntity {
    @Column(name = "name")
    String name;
}
