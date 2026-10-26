package com.mosaicchurchaustin.oms.services.limits;

import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitRule;
import com.mosaicchurchaustin.oms.data.entity.item.LimitPeriodUnit;
import com.mosaicchurchaustin.oms.data.entity.item.LimitWindow;
import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;
import com.mosaicchurchaustin.oms.services.limits.ItemLimitCalculator.Receipt;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ItemLimitCalculatorTest {

    private static Instant local(final String isoLocalDateTime) {
        return LocalDateTime.parse(isoLocalDateTime).atZone(ItemLimitCalculator.ZONE).toInstant();
    }

    private static ItemLimitRule rule(final int quantity, final int periodValue, final LimitPeriodUnit unit,
                                      final LimitWindow window, final Integer startMonth) {
        return ItemLimitRule.builder()
                .quantity(quantity)
                .periodValue(periodValue)
                .periodUnit(unit)
                .window(window)
                .periodStartMonth(startMonth)
                .build();
    }

    @Test
    void rolling_noHistory_isEligible() {
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.ROLLING, null),
                List.of(), local("2026-10-18T10:00:00"), null);

        assertThat(status.receivedInPeriod()).isZero();
        assertThat(status.remaining()).isEqualTo(1);
        assertThat(status.lastReceivedAt()).isNull();
        assertThat(status.nextEligibleAt()).isNull();
        assertThat(status.overLimit()).isNull();
    }

    @Test
    void rolling_atLimit_eligibleFromStartOfDayOneYearLater() {
        final Instant coat = local("2026-03-03T11:00:00");
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.ROLLING, null),
                List.of(new Receipt(coat, 1)), local("2026-10-18T10:00:00"), 1);

        assertThat(status.receivedInPeriod()).isEqualTo(1);
        assertThat(status.remaining()).isZero();
        assertThat(status.lastReceivedAt()).isEqualTo(coat);
        assertThat(status.nextEligibleAt()).isEqualTo(local("2027-03-03T00:00:00"));
        assertThat(status.overLimit()).isTrue();
    }

    @Test
    void rolling_receiptOutsideWindow_notCountedButStillLastReceived() {
        final Instant oldCoat = local("2025-01-10T09:00:00");
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.ROLLING, null),
                List.of(new Receipt(oldCoat, 1)), local("2026-10-18T10:00:00"), 1);

        assertThat(status.receivedInPeriod()).isZero();
        assertThat(status.remaining()).isEqualTo(1);
        assertThat(status.lastReceivedAt()).isEqualTo(oldCoat);
        assertThat(status.overLimit()).isFalse();
    }

    @Test
    void rolling_multipleUnits_waitsForEnoughToAgeOut() {
        // 2 per month, received 1 on Oct 1 and 2 on Oct 10: need 2 units to age out before 1 more is allowed
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(2, 1, LimitPeriodUnit.MONTH, LimitWindow.ROLLING, null),
                List.of(new Receipt(local("2026-10-10T12:00:00"), 2), new Receipt(local("2026-10-01T12:00:00"), 1)),
                local("2026-10-18T10:00:00"), null);

        assertThat(status.receivedInPeriod()).isEqualTo(3);
        assertThat(status.remaining()).isZero();
        assertThat(status.nextEligibleAt()).isEqualTo(local("2026-11-10T00:00:00"));
    }

    @Test
    void rolling_weekly_timeOfDayDoesNotMatter() {
        // Received Monday 10:40am; back the next Monday at 9:50am
        final ItemLimitRule weekly = rule(1, 1, LimitPeriodUnit.WEEK, LimitWindow.ROLLING, null);
        final List<Receipt> receipts = List.of(new Receipt(local("2026-10-12T10:40:00"), 1));

        final ItemLimitStatus nextMonday = ItemLimitCalculator.evaluate(weekly, receipts, local("2026-10-19T09:50:00"), 1);
        assertThat(nextMonday.receivedInPeriod()).isZero();
        assertThat(nextMonday.overLimit()).isFalse();

        final ItemLimitStatus sunday = ItemLimitCalculator.evaluate(weekly, receipts, local("2026-10-18T23:59:00"), 1);
        assertThat(sunday.overLimit()).isTrue();
        assertThat(sunday.nextEligibleAt()).isEqualTo(local("2026-10-19T00:00:00"));
    }

    @Test
    void rolling_monthEnd_countsUntilTheEligibleDay() {
        // Jan 31 + 1 month = Feb 28: still counted on Feb 27, not on Feb 28
        final ItemLimitRule monthly = rule(1, 1, LimitPeriodUnit.MONTH, LimitWindow.ROLLING, null);
        final List<Receipt> receipts = List.of(new Receipt(local("2026-01-31T15:00:00"), 1));

        final ItemLimitStatus feb27 = ItemLimitCalculator.evaluate(monthly, receipts, local("2026-02-27T12:00:00"), 1);
        assertThat(feb27.overLimit()).isTrue();
        assertThat(feb27.nextEligibleAt()).isEqualTo(local("2026-02-28T00:00:00"));

        final ItemLimitStatus feb28 = ItemLimitCalculator.evaluate(monthly, receipts, local("2026-02-28T08:00:00"), 1);
        assertThat(feb28.overLimit()).isFalse();
    }

    @Test
    void rolling_requestingMoreThanRemaining_isOverLimit() {
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(2, 1, LimitPeriodUnit.MONTH, LimitWindow.ROLLING, null),
                List.of(new Receipt(local("2026-10-10T12:00:00"), 1)),
                local("2026-10-18T10:00:00"), 2);

        assertThat(status.remaining()).isEqualTo(1);
        assertThat(status.nextEligibleAt()).isNull();
        assertThat(status.overLimit()).isTrue();
    }

    @Test
    void zeroQuantityReceipts_areIgnored() {
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.ROLLING, null),
                List.of(new Receipt(local("2026-10-10T12:00:00"), 0)),
                local("2026-10-18T10:00:00"), null);

        assertThat(status.receivedInPeriod()).isZero();
        assertThat(status.lastReceivedAt()).isNull();
    }

    @Test
    void receiptsAfterAsOf_areIgnored() {
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.ROLLING, null),
                List.of(new Receipt(local("2026-10-20T12:00:00"), 1)),
                local("2026-10-18T10:00:00"), null);

        assertThat(status.receivedInPeriod()).isZero();
        assertThat(status.lastReceivedAt()).isNull();
    }

    @Test
    void calendarMonth_resetsOnFirstOfMonthLocalTime() {
        final ItemLimitRule rule = rule(2, 1, LimitPeriodUnit.MONTH, LimitWindow.CALENDAR, null);
        final ItemLimitStatus status = ItemLimitCalculator.evaluate(
                rule,
                List.of(
                        new Receipt(local("2026-09-30T23:30:00"), 2), // previous month, local time
                        new Receipt(local("2026-10-01T00:30:00"), 1),
                        new Receipt(local("2026-10-12T00:30:00"), 1)),
                local("2026-10-18T10:00:00"), null);

        assertThat(status.periodStart()).isEqualTo(local("2026-10-01T00:00:00"));
        assertThat(status.receivedInPeriod()).isEqualTo(2);
        assertThat(status.nextEligibleAt()).isEqualTo(local("2026-11-01T00:00:00"));
    }

    @Test
    void calendarYear_withStartMonth_isASeason() {
        // "1 coat per winter season" starting October
        final ItemLimitRule rule = rule(1, 1, LimitPeriodUnit.YEAR, LimitWindow.CALENDAR, 10);

        final ItemLimitStatus beforeReset = ItemLimitCalculator.evaluate(
                rule, List.of(new Receipt(local("2026-01-12T11:00:00"), 1)), local("2026-09-15T10:00:00"), 1);
        assertThat(beforeReset.periodStart()).isEqualTo(local("2025-10-01T00:00:00"));
        assertThat(beforeReset.overLimit()).isTrue();
        assertThat(beforeReset.nextEligibleAt()).isEqualTo(local("2026-10-01T00:00:00"));

        final ItemLimitStatus afterReset = ItemLimitCalculator.evaluate(
                rule, List.of(new Receipt(local("2026-01-12T11:00:00"), 1)), local("2026-10-18T10:00:00"), 1);
        assertThat(afterReset.periodStart()).isEqualTo(local("2026-10-01T00:00:00"));
        assertThat(afterReset.receivedInPeriod()).isZero();
        assertThat(afterReset.overLimit()).isFalse();
    }

    @Test
    void calendarQuarter_alignsToStartMonth() {
        final ItemLimitRule quarters = rule(1, 3, LimitPeriodUnit.MONTH, LimitWindow.CALENDAR, null);
        assertThat(ItemLimitCalculator.calendarPeriodStart(quarters, local("2026-11-18T10:00:00")))
                .isEqualTo(local("2026-10-01T00:00:00"));
        assertThat(ItemLimitCalculator.calendarPeriodStart(quarters, local("2026-02-01T10:00:00")))
                .isEqualTo(local("2026-01-01T00:00:00"));

        final ItemLimitRule halves = rule(1, 6, LimitPeriodUnit.MONTH, LimitWindow.CALENDAR, 4);
        assertThat(ItemLimitCalculator.calendarPeriodStart(halves, local("2026-02-01T10:00:00")))
                .isEqualTo(local("2025-10-01T00:00:00"));
    }

    @Test
    void calendarWeek_startsMonday() {
        final ItemLimitRule weekly = rule(1, 1, LimitPeriodUnit.WEEK, LimitWindow.CALENDAR, null);
        // 2026-10-18 is a Sunday
        assertThat(ItemLimitCalculator.calendarPeriodStart(weekly, local("2026-10-18T10:00:00")))
                .isEqualTo(local("2026-10-12T00:00:00"));

        final ItemLimitRule biweekly = rule(1, 2, LimitPeriodUnit.WEEK, LimitWindow.CALENDAR, null);
        final Instant start = ItemLimitCalculator.calendarPeriodStart(biweekly, local("2026-10-18T10:00:00"));
        assertThat(ItemLimitCalculator.calendarPeriodStart(biweekly, start)).isEqualTo(start);
        assertThat(ItemLimitCalculator.calendarPeriodStart(biweekly, local("2026-10-18T10:00:00").plusSeconds(14 * 86400)))
                .isAfter(start);
    }
}
