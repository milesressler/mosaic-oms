package com.mosaicchurchaustin.oms.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.util.UUID;

@Getter
@MappedSuperclass
public abstract class BaseUuidEntity extends BaseEntity {

    @Column(name = "uuid")
    String uuid;

    @Override
    protected void onCreate() {
        super.onCreate();
        this.uuid = UUID.randomUUID().toString();
    }
}
