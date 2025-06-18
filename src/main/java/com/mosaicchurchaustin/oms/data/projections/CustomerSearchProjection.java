package com.mosaicchurchaustin.oms.data.projections;

import java.time.Instant;

public interface CustomerSearchProjection {
    String getFirstName();
    String getLastName();
    String getUuid();
    boolean isFlagged();
    int getMatchScore();
    Instant getShowerWaiverCompleted();
}

