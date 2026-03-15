package com.mosaicchurchaustin.oms.services.audit;

import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import com.mosaicchurchaustin.oms.data.constants.AuditAction;
import com.mosaicchurchaustin.oms.data.entity.BaseEntity;
import com.mosaicchurchaustin.oms.data.entity.BaseUuidEntity;
import com.mosaicchurchaustin.oms.data.entity.audit.AuditLogEntry;
import com.mosaicchurchaustin.oms.data.entity.customer.CustomerEntity;
import com.mosaicchurchaustin.oms.data.response.AuditLogResponse;
import com.mosaicchurchaustin.oms.repositories.AuditLogEntryRepository;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

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
        entry.setUserId(getExternalIdFromAuth().orElse(null));
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

    public void logCustomerMerge(final CustomerEntity fromCustomer, final CustomerEntity toCustomer) {
        final AuditLogEntry entry = AuditLogEntry.builder()
                .userId(getExternalIdFromAuth().orElse(null))
                .action(AuditAction.MERGE)
                .entityType(CustomerEntity.ENTITY_TYPE)
                .entityId(fromCustomer.getId())
                .entityUuid(fromCustomer.getUuid())
                .previousState(customerStateMap(fromCustomer))
                .newState(customerStateMap(toCustomer))
                .build();
        auditLogEntryRepository.save(entry);
    }

    private Map<String, String> customerStateMap(final CustomerEntity customer) {
        final Map<String, String> state = new java.util.HashMap<>();
        state.put("id", String.valueOf(customer.getId()));
        state.put("uuid", customer.getUuid());
        state.put("firstName", customer.getFirstName());
        state.put("lastName", customer.getLastName());
        return state;
    }

    private Optional<String> getExternalIdFromAuth() {
        try {
            return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
