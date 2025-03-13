package com.mosaicchurchaustin.oms.data.jpa;

public interface CustomerSearchProjection {
    String getName();
    String getUuid();
    int getMatchScore();
}

