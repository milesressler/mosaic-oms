package com.mosaicchurchaustin.oms.data.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ItemMetricsResponse {
    private Long totalRequested;
    private Long totalFulfilled;
    private Double fillRate; // as decimal (e.g., 0.82 for 82%)
}