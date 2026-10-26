import {DateTime} from "luxon";
import {ItemLimitRule, ItemLimitStatus, LimitPeriodUnit} from "src/models/types.tsx";

export const LIMIT_ZONE = 'America/Chicago';

const unitLabels: Record<LimitPeriodUnit, string> = {
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
};

export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/** "1 per year", "2 per month", "1 per 3 months" */
export const formatLimitRule = (rule: ItemLimitRule): string => {
    const unit = unitLabels[rule.periodUnit];
    const period = rule.periodValue === 1 ? unit : `${rule.periodValue} ${unit}s`;
    return `${rule.quantity} per ${period}`;
};

/** How the period is counted, e.g. "rolling", "resets on the 1st", "season starts October" */
export const formatLimitWindow = (rule: ItemLimitRule): string => {
    if (rule.window === 'ROLLING') {
        return 'rolling';
    }
    if (rule.periodUnit === 'WEEK') {
        return rule.periodValue === 1 ? 'resets Mondays' : `resets every ${rule.periodValue} weeks`;
    }
    if (rule.periodUnit === 'MONTH' && rule.periodValue === 1) {
        return 'resets on the 1st';
    }
    return `resets ${monthNames[(rule.periodStartMonth ?? 1) - 1]} 1`;
};

const formatDate = (iso: string): string => {
    const date = DateTime.fromISO(iso).setZone(LIMIT_ZONE);
    return date.toFormat(date.year === DateTime.now().year ? 'MMM d' : 'MMM d, yyyy');
};

/** The window being counted, in words: "in the last year", "this month", "since Oct 1" */
const formatPeriod = (status: ItemLimitStatus): string => {
    const {rule} = status;
    const unit = unitLabels[rule.periodUnit];
    if (rule.window === 'ROLLING') {
        return rule.periodValue === 1 ? `in the last ${unit}` : `in the last ${rule.periodValue} ${unit}s`;
    }
    const startsInJanuary = (rule.periodStartMonth ?? 1) === 1;
    if (rule.periodValue === 1 && (rule.periodUnit !== 'YEAR' || startsInJanuary)) {
        return `this ${unit}`;
    }
    return `since ${formatDate(status.periodStart)}`;
};

/** "1 of 2 this month" */
export const formatReceivedInPeriod = (status: ItemLimitStatus): string =>
    `${status.receivedInPeriod} of ${status.rule.quantity} ${formatPeriod(status)}`;

/**
 * Relative time from the moment the status describes. For live statuses that is now ("3 weeks ago");
 * for order snapshots it is the moment the order was taken ("3 weeks before order").
 */
const relativeTo = (iso: string, status: ItemLimitStatus, snapshot: boolean): string => {
    const base = snapshot ? DateTime.fromISO(status.evaluatedAt) : DateTime.now();
    const relative = DateTime.fromISO(iso).toRelative({base}) ?? '';
    return snapshot ? relative.replace(/ ago$/, ' before order').replace(/^in /, '') : relative;
};

export const formatLastReceived = (status: ItemLimitStatus, snapshot: boolean): string =>
    status.lastReceivedAt
        ? `Last received ${formatDate(status.lastReceivedAt)} (${relativeTo(status.lastReceivedAt, status, snapshot)})`
        : 'Not received before';

export const formatNextEligible = (status: ItemLimitStatus): string | null =>
    status.nextEligibleAt ? `Eligible again ${formatDate(status.nextEligibleAt)}` : null;

/** Whether adding `requested` units would go over the limit */
export const isOverLimit = (status: ItemLimitStatus, requested: number): boolean =>
    requested > status.remaining;
