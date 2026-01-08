package com.mosaicchurchaustin.oms.data.projections;

public interface SystemOverviewProjection {
    Long getFulfilledItems();
    Long getTotalItems();
    Long getCompletedOrders();
    Long getUniqueCustomers();
}
