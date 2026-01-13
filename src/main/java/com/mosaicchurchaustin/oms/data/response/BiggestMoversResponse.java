package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BiggestMoversResponse {
    
    @Data
    @Builder
    public static class ItemMover {
        String itemName;
        String itemId;
        Long thisWeekCount;
        Double fourWeekAvg;
        Long absoluteChange;
        Double percentageChange;
        MovementDirection direction;
    }
    
    public enum MovementDirection {
        UP, DOWN, FLAT
    }
    
    List<ItemMover> movers;
}
