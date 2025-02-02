package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.util.Calendar;

@Entity
@Table(name = "customers")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CustomerEntity extends BaseUuidEntity {

    public static String ENTITY_TYPE = "Customer";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @Column(name = "name")
    String name;

    @Column(name = "shower_waiver_completed")
    Calendar showerWaiverCompleted;
}
