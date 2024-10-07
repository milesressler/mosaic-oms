package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "firstName")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FirstNameEntity extends BaseUuidEntity {

    public static String ENTITY_TYPE = "FirstName";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @Column(name = "FirstName")
    String name;
}
