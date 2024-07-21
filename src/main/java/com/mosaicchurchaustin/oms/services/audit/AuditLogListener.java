package com.mosaicchurchaustin.oms.services.audit;


import com.mosaicchurchaustin.oms.config.AuditConfig;
import com.mosaicchurchaustin.oms.data.constants.AuditAction;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;

//@Component
public class AuditLogListener {

//    @Autowired
//    private AuditService auditService;

    @PrePersist
    @PreUpdate
    @PreRemove
    public void beforeAnyUpdate(final Object entity) {
        // Capture the state of the entity before saving
        if (entity instanceof Auditable auditable) {
            auditable.stashState();
        }
    }

    @PostPersist
    public void afterCreate(final Object entity) {
        afterAnyUpdate(entity, AuditAction.CREATE);
    }

    @PostUpdate
    public void afterUpdate(final Object entity) {
        afterAnyUpdate(entity, AuditAction.UPDATE);
    }

    @PostRemove
    public void afterDelete(final Object entity) {
        afterAnyUpdate(entity, AuditAction.DELETE);
    }

    public void afterAnyUpdate(final Object entity, final AuditAction auditAction) {
        // Capture the state of the entity after saving
        if (entity instanceof Auditable auditable) {
            AuditConfig.AUDIT_SERVICE.logAction(auditable, auditAction);
        }
    }
}
