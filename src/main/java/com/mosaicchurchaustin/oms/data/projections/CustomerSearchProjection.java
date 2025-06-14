package com.mosaicchurchaustin.oms.data.projections;

public interface CustomerSearchProjection {
    String getFirstName();
    String getLastName();
    String getUuid();
    boolean isFlagged();
    int getMatchScore();
}

