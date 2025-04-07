package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Calendar;

@Entity
@Table(name = "devices")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class DeviceEntity extends BaseUuidEntity {

    public static String ENTITY_TYPE = "Device";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }


    @Column(name = "name")
    String name;

    @Column(name = "hashed_token")
    String hashedToken;

    @Column(name = "user_agent")
    String userAgent;

    @Transient
    String rawToken;

    @Column(name = "last_accessed")
    Calendar lastAccessed;

    @Column(name = "expiration")
    Calendar expiration;
}
