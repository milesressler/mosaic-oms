package com.mosaicchurchaustin.oms.data.projections;

public interface ProcessTimingProjection {
    Double getAvgLagTimeSeconds();
    Double getAvgPackToDeliverySeconds();
    Double getAvgDistributionTimeSeconds();
}