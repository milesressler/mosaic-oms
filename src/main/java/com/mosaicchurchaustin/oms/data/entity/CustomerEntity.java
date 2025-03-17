package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Calendar;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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

    // @Column(name = "name")
    // String name;

    @Column(name = "shower_waiver_completed")
    Calendar showerWaiverCompleted;
    @Column(name = "firstName")
    String firstNameString;
    @Column(name = "lastName")
    String lastNameString;
}
