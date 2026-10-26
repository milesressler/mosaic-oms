package com.mosaicchurchaustin.oms.data.entity.item;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * "N per period" rule for a limited item, e.g. 1 per 1 YEAR or 2 per 1 MONTH.
 * Also serialized as JSON inside order item limit snapshots and returned to the frontend as is.
 */
@Embeddable
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@ToString
public class ItemLimitRule implements Serializable {

    @Column(name = "limit_quantity")
    Integer quantity;

    @Column(name = "limit_period_value")
    Integer periodValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "limit_period_unit")
    LimitPeriodUnit periodUnit;

    @Enumerated(EnumType.STRING)
    @Column(name = "limit_window")
    LimitWindow window;

    /**
     * CALENDAR month/year periods only: month (1-12) the period starts in. Null means January.
     */
    @Column(name = "limit_period_start_month")
    Integer periodStartMonth;
}
