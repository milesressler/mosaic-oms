package com.mosaicchurchaustin.oms.data.entity;

public enum TimingType {
    ORDER_TAKER_TIME("Order Taker Time"),
    FULFILLMENT_TIME("Fulfillment Time");

    private final String displayName;

    TimingType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}