package com.mosaicchurchaustin.oms.data.entity.user;

import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import com.mosaicchurchaustin.oms.services.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.Optional;

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

    @Column(name = "avatar")
    String avatar;

    @Column(name = "username", unique = true)
    String username;

    @Column(name = "last_seen_changelog_id")
    private String lastSeenChangelogId;

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
                "name", Optional.ofNullable(name).orElse(""),
                "username", Optional.ofNullable(username).orElse("")
        );
    }

}
