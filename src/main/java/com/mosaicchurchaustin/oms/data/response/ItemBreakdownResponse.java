package com.mosaicchurchaustin.oms.data.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ItemBreakdownResponse {
    private Long itemId;
    private String groupBy;
    private String secondaryGroupBy; // nullable
    private List<ItemBreakdownData> data;

    @Data
    @Builder
    @AllArgsConstructor
    public static class ItemBreakdownData {
        private LocalDate weekStart; // nullable for aggregated-only view
        private String primaryValue; // "Size 32", "Blue", etc.
        private String secondaryValue; // nullable if no secondary grouping
        private Long requestedCount;
        private Long fulfilledCount;
    }
}