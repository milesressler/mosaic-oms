package com.mosaicchurchaustin.oms.data.entity.user;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity extends BaseUuidEntity {

    @Column(name = "name")
    String name;

    @Column(name = "username")
    String username;

    @Column(name = "source")
    UserSource source;
}
