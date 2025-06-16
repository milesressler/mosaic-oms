import { DateTime } from "luxon";
import { ShowerReservationResponse } from "src/models/types";

const STALL_COUNT = 2;
const CLEANUP_MINUTES = 3;
const SHOWER_DURATION_MINUTES = 15;

type WaitEstimate = {
    waitMinutes: number;
    readable: string;
    readyNow: boolean;
};

/**
 * Calculates wait time for each person in the queue
 */
export function getWaitEstimates(
    active: ShowerReservationResponse[],
    queueLength: number
): WaitEstimate[] {
    const now = DateTime.now();

    // Build initial stall availability (sorted by earliest available)
    const activeEndTimes = active
        .map((r) => DateTime.fromISO(r.endTime!))
        .filter((dt) => dt.isValid && dt > now)
        .sort((a, b) => a.toMillis() - b.toMillis());

    const stallSchedule: DateTime[] = [...activeEndTimes];

    // Fill with immediately available stalls if any
    while (stallSchedule.length < STALL_COUNT) {
        stallSchedule.push(now);
    }

    const estimates: WaitEstimate[] = [];

    for (let i = 0; i < queueLength; i++) {
        // Find next stall that becomes available
        const earliestAvailable = stallSchedule.shift()!;
        const waitDuration = earliestAvailable.diff(now, ["minutes"]).as("minutes");
        const waitMinutes = Math.max(0, Math.round(waitDuration));
        const readyNow = waitMinutes === 0;

        const readable = readyNow
            ? "Ready now"
            : waitMinutes === 1
                ? "1 minute"
                : `${waitMinutes} minutes`;

        estimates.push({ waitMinutes, readable, readyNow });

        // Add new end time to the stall schedule after this person's shower completes
        const nextAvailable = earliestAvailable.plus({
            minutes: SHOWER_DURATION_MINUTES + CLEANUP_MINUTES,
        });

        stallSchedule.push(nextAvailable);
        stallSchedule.sort((a, b) => a.toMillis() - b.toMillis());
    }

    return estimates;
}
