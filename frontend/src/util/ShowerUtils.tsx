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
 * Calculates wait time for each person in the queue who is NOT already assigned to a stall.
 */export function getWaitEstimates(
    active: ShowerReservationResponse[],
    queued: ShowerReservationResponse[]
): WaitEstimate[] {
    const now = DateTime.now();
    const activeEndTimes = active.map((r) => {
        if (r.endTime) return DateTime.fromISO(r.endTime);
        return now.plus({ minutes: SHOWER_DURATION_MINUTES + CLEANUP_MINUTES });
    }).filter(dt => dt.isValid);

    const stallSchedule: DateTime[] = activeEndTimes
        .sort((a, b) => a.toMillis() - b.toMillis());

// Fill in additional empty stalls (i.e. unoccupied)
    while (stallSchedule.length < STALL_COUNT) {
        stallSchedule.push(now);
    }

// Optional: re-sort again in case "now" inserted
    stallSchedule.sort((a, b) => a.toMillis() - b.toMillis());


    const estimates: WaitEstimate[] = [];
    const unassigned = queued.filter((r) => r.showerNumber == null);

    for (let i = 0; i < unassigned.length; i++) {
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

        const nextAvailable = earliestAvailable.plus({
            minutes: SHOWER_DURATION_MINUTES + CLEANUP_MINUTES,
        });

        stallSchedule.push(nextAvailable);
        stallSchedule.sort((a, b) => a.toMillis() - b.toMillis());
    }

    return queued.map((r) => {
        const idx = unassigned.findIndex((u) => u.uuid === r.uuid);
        return idx >= 0 ? estimates[idx] : { waitMinutes: 0, readable: "-", readyNow: false };
    });
}

