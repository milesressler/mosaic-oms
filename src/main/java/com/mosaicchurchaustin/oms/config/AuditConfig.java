package com.mosaicchurchaustin.oms.config;

import com.mosaicchurchaustin.oms.services.audit.AuditService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuditConfig {

    public static AuditService AUDIT_SERVICE;

    @Bean(autowireCandidate = false)
    @Qualifier("staticAuditService")
    static AuditService staticAuditService(AuditService auditService) {
        AUDIT_SERVICE = auditService;
        return auditService;
    }

}
