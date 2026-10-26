package com.mosaicchurchaustin.oms.data.entity.item;

import com.mosaicchurchaustin.oms.exception.EntityNotFoundException;

import java.util.Arrays;

public enum LimitPeriodUnit {
    WEEK,
    MONTH,
    YEAR;

    public static LimitPeriodUnit from(final String unitString) {
        return Arrays.stream(LimitPeriodUnit.values()).filter(unit -> unit.name().equalsIgnoreCase(unitString))
                .findAny().orElseThrow(() -> new EntityNotFoundException("LimitPeriodUnit", unitString));
    }
}
