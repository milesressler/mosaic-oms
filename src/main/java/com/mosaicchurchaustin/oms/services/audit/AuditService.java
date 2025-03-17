package com.mosaicchurchaustin.oms.services.audit;

import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import com.mosaicchurchaustin.oms.data.constants.AuditAction;
import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.audit.AuditLogEntry;
import com.mosaicchurchaustin.oms.data.response.AuditLogResponse;
import com.mosaicchurchaustin.oms.repositories.AuditLogEntryRepository;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuditService {

    @Autowired
    private AuditLogEntryRepository auditLogEntryRepository;

    public Page<AuditLogResponse> getActionsFor(final Pageable pageable, final String userId) {
        throw new NotImplementedException("wip");
    }

    public Page<AuditLogResponse> getAuditLog(final Pageable pageable) {
        throw new NotImplementedException("wip");
    }

    public Page<AuditLogResponse> getAuditForOrder(final Pageable pageable, final Long orderId) {
        throw new NotImplementedException("wip");
    }

    public void logAction(final Auditable auditable, final AuditAction auditAction) {
        if (auditAction == AuditAction.UPDATE && auditable.getPreviousState() != null) {
            final MapDifference<String, String> difference =
                    Maps.difference(auditable.getCurrentState(), auditable.getPreviousState());
            if (difference.areEqual()) {
                return;
            }
        }

        final AuditLogEntry entry = new AuditLogEntry();
        entry.setUserId(getExternalIdFromAuth());
        entry.setAction(auditAction);
        if (auditAction != AuditAction.CREATE) {
            entry.setPreviousState(auditable.getPreviousState());
        } else {
            entry.setPreviousState(Collections.emptyMap());
        }
        if (auditAction != AuditAction.DELETE) {
            entry.setNewState(auditable.getCurrentState());
        } else {
            entry.setNewState(Collections.emptyMap());
        }

        if (auditable instanceof BaseEntity baseEntity) {
            entry.setEntityId(baseEntity.getId());
            entry.setEntityType(baseEntity.getEntityType());
        } else {
            entry.setEntityType(auditable.getClass().getSimpleName());
        }

        if (auditable instanceof BaseUuidEntity uuidEntity) {
            entry.setEntityUuid(uuidEntity.getUuid());
        }

        auditLogEntryRepository.save(entry);
    }

    private String getExternalIdFromAuth() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
