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
@Table(name = "lastName")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class LastNameEntity extends BaseUuidEntity {

    public static String ENTITY_TYPE = "LastName";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @Column(name = "LastName")
    String name;
}
