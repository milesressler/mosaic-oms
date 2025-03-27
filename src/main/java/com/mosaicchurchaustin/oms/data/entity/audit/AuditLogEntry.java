package com.mosaicchurchaustin.oms.data.entity.audit;

import com.mosaicchurchaustin.oms.data.constants.AuditAction;
import com.mosaicchurchaustin.oms.support.converters.JsonAttributeConverter;
import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogEntry extends BaseEntity {

    @Column(name = "user_id")
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action")
    private AuditAction action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "entity_uuid")
    private String entityUuid;

    @Convert(converter = JsonAttributeConverter.class)
    @Column(columnDefinition = "json", name = "previous_state")
    private Map<String, String> previousState;

    @Convert(converter = JsonAttributeConverter.class)
    @Column(columnDefinition = "json", name = "new_state")
    private Map<String, String> newState;


    @Lob
    private String additionalInfo;
}
