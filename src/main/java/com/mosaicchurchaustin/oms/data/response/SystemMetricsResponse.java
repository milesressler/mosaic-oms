package com.mosaicchurchaustin.oms.data.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SystemMetricsResponse {
    private SystemOverview overview;

    @Data
    @Builder
    @AllArgsConstructor
    public static class SystemOverview {
        private long totalOrders;
        private long totalCustomers;
        private long totalItems;
        private double avgItemsPerOrder;
        private double fillRate; // as decimal (e.g., 0.78 for 78%)
        private long activeVolunteers;
    }

}
