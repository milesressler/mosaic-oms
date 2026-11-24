package com.mosaicchurchaustin.oms.data.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class SpecialEventResponse {
    private String uuid;
    private String name;
    private LocalDate eventDate;
    private Integer itemsPerGuest;
    private boolean active;
    private boolean archived;
    /** Whether any orders were taken for the event; events with orders can't be deleted */
    private boolean hasOrders;
    private List<SpecialEventItemResponse> items;
}
