package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;

import java.util.UUID;

public abstract class BaseUuidEntity extends BaseEntity {

    @Column(name = "uuid")
    String uuid;

    @Override
    @PrePersist
    protected void onCreate() {
        super.onCreate();
        this.uuid = UUID.randomUUID().toString();
    }
}
