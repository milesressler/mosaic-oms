package com.mosaicchurchaustin.oms.services.limits;

import com.mosaicchurchaustin.oms.data.entity.item.ItemLimitRule;
import com.mosaicchurchaustin.oms.data.entity.item.LimitPeriodUnit;
import com.mosaicchurchaustin.oms.data.entity.item.LimitWindow;
import com.mosaicchurchaustin.oms.data.entity.order.ItemLimitStatus;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Pure date math for limited items. Everything is evaluated in whole days in the ministry's local time,
 * so the time of day something was received never matters: a weekly item received any time on a Monday
 * is available again all day the following Monday.
 */
public final class ItemLimitCalculator {

    public static final ZoneId ZONE = ZoneId.of("America/Chicago");

    // A Monday, used to line up multi-week calendar periods (e.g. "every 2 weeks") consistently
    private static final LocalDate WEEK_ANCHOR = LocalDate.of(2024, 1, 1);

    /**
     * Units of a limited item handed out on one completed order.
     */
    public record Receipt(Instant receivedAt, int quantity) {
    }

    private ItemLimitCalculator() {
    }

    public static ItemLimitStatus evaluate(final ItemLimitRule rule,
                                           final Collection<Receipt> receipts,
                                           final Instant asOf,
                                           final Integer requestedQuantity) {
        final List<Receipt> received = receipts.stream()
                .filter(receipt -> receipt.quantity() > 0 && receipt.receivedAt() != null)
                .filter(receipt -> !receipt.receivedAt().isAfter(asOf))
                .sorted(Comparator.comparing(Receipt::receivedAt))
                .toList();

        final boolean calendar = rule.getWindow() == LimitWindow.CALENDAR;
        final Instant periodStart = calendar ? calendarPeriodStart(rule, asOf) : rollingPeriodStart(rule, asOf);

        final LocalDate today = localDate(asOf);
        final List<Receipt> inPeriod = received.stream()
                .filter(receipt -> calendar
                        ? !receipt.receivedAt().isBefore(periodStart)
                        // Counts until the day it ages out, so this stays consistent with nextEligibleAt
                        : rollingAgesOutOn(rule, receipt).isAfter(today))
                .toList();

        final int receivedInPeriod = inPeriod.stream().mapToInt(Receipt::quantity).sum();
        final int remaining = Math.max(0, rule.getQuantity() - receivedInPeriod);

        final Instant nextEligibleAt;
        if (remaining > 0) {
            nextEligibleAt = null;
        } else if (calendar) {
            nextEligibleAt = localDate(periodStart).plus(rule.getPeriodValue(), chronoUnit(rule.getPeriodUnit()))
                    .atStartOfDay(ZONE).toInstant();
        } else {
            nextEligibleAt = rollingNextEligible(rule, inPeriod, receivedInPeriod);
        }

        return ItemLimitStatus.builder()
                .rule(rule.toBuilder().build())
                .evaluatedAt(asOf)
                .periodStart(periodStart)
                .receivedInPeriod(receivedInPeriod)
                .remaining(remaining)
                .lastReceivedAt(received.isEmpty() ? null : received.get(received.size() - 1).receivedAt())
                .nextEligibleAt(nextEligibleAt)
                .requestedQuantity(requestedQuantity)
                .overLimit(requestedQuantity == null ? null : requestedQuantity > remaining)
                .build();
    }

    /**
     * First day counted by a rolling window. Informational only; whether a receipt counts is decided by
     * {@link #rollingAgesOutOn} so month-end dates (e.g. Jan 31 + 1 month = Feb 28) stay consistent.
     */
    private static Instant rollingPeriodStart(final ItemLimitRule rule, final Instant asOf) {
        return localDate(asOf).minus(rule.getPeriodValue(), chronoUnit(rule.getPeriodUnit())).plusDays(1)
                .atStartOfDay(ZONE).toInstant();
    }

    /**
     * The local day a rolling receipt stops counting, i.e. the day the customer can receive it again
     */
    private static LocalDate rollingAgesOutOn(final ItemLimitRule rule, final Receipt receipt) {
        return localDate(receipt.receivedAt()).plus(rule.getPeriodValue(), chronoUnit(rule.getPeriodUnit()));
    }

    /**
     * Receipts age out of a rolling window one at a time, oldest first. The customer is eligible again
     * once enough units have aged out to leave room for one more.
     */
    private static Instant rollingNextEligible(final ItemLimitRule rule, final List<Receipt> inPeriod, final int receivedInPeriod) {
        final int mustAgeOut = receivedInPeriod - rule.getQuantity() + 1;
        int agedOut = 0;
        for (final Receipt receipt : inPeriod) {
            agedOut += receipt.quantity();
            if (agedOut >= mustAgeOut) {
                return rollingAgesOutOn(rule, receipt).atStartOfDay(ZONE).toInstant();
            }
        }
        return null;
    }

    static Instant calendarPeriodStart(final ItemLimitRule rule, final Instant asOf) {
        final LocalDate date = localDate(asOf);
        final int periodValue = rule.getPeriodValue();

        if (rule.getPeriodUnit() == LimitPeriodUnit.WEEK) {
            final LocalDate monday = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            final long periodIndex = Math.floorDiv(ChronoUnit.WEEKS.between(WEEK_ANCHOR, monday), periodValue);
            return WEEK_ANCHOR.plusWeeks(periodIndex * periodValue).atStartOfDay(ZONE).toInstant();
        }

        // Month and year periods are counted in months, lined up to the configured start month
        final int periodMonths = rule.getPeriodUnit() == LimitPeriodUnit.YEAR ? periodValue * 12 : periodValue;
        final int startMonthOffset = Objects.requireNonNullElse(rule.getPeriodStartMonth(), 1) - 1;
        final long monthIndex = date.getYear() * 12L + (date.getMonthValue() - 1);
        final long periodStartMonthIndex = Math.floorDiv(monthIndex - startMonthOffset, periodMonths) * periodMonths + startMonthOffset;

        return LocalDate.of((int) Math.floorDiv(periodStartMonthIndex, 12), (int) Math.floorMod(periodStartMonthIndex, 12) + 1, 1)
                .atStartOfDay(ZONE)
                .toInstant();
    }

    private static LocalDate localDate(final Instant instant) {
        return instant.atZone(ZONE).toLocalDate();
    }

    private static ChronoUnit chronoUnit(final LimitPeriodUnit unit) {
        return switch (unit) {
            case WEEK -> ChronoUnit.WEEKS;
            case MONTH -> ChronoUnit.MONTHS;
            case YEAR -> ChronoUnit.YEARS;
        };
    }
}
