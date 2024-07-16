package com.mosaicchurchaustin.oms.data.entity.user;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity extends BaseUuidEntity {

    @Column(unique = true, name = "external_id")
    String externalId;

    @Column(name = "name")
    String name;

    @Column(name = "username", unique = true)
    String username;

    @Column(name = "source")
    UserSource source;
}
