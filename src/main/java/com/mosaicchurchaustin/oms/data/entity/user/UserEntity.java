package com.mosaicchurchaustin.oms.data.entity.user;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import com.mosaicchurchaustin.oms.services.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.*;

import java.util.Map;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditLogListener.class)
public class UserEntity extends BaseUuidEntity implements Auditable {

    public static String ENTITY_TYPE = "User";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }
    @Column(unique = true, name = "external_id")
    String externalId;

    @Column(name = "name")
    String name;

    @Column(name = "username", unique = true)
    String username;

    @Column(name = "source")
    UserSource source;

    @Transient
    @Getter
    Map<String, String> previousState;

    @Override
    public void stashState() {
        previousState = getCurrentState();
    }

    @Override
    public Map<String, String> getCurrentState() {
        return Map.of(
                "name", name,
                "username", username
        );
    }

}
