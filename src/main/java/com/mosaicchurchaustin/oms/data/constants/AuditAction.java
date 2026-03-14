package com.mosaicchurchaustin.oms.data.constants;

import lombok.Getter;

@Getter
public enum AuditAction {
    CREATE("create"),
    UPDATE("update"),
    DELETE("delete"),
    MERGE("merge");

    final String action;

    AuditAction(final String action) {
        this.action = action;
    }
}
