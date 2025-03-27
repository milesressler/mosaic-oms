package com.mosaicchurchaustin.oms.data.projections;

public interface CustomerSearchProjection {
    String getName();
    String getUuid();
    int getMatchScore();
}

