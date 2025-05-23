import { usePostHog } from 'posthog-js/react';
import { useRef } from 'react';

export function useOrderFulfillmentTracking() {
    const posthog = usePostHog();
    const startTimeRef = useRef<number | null>(null);
    const orderIdRef = useRef<string | null>(null);

    const startFilling = (orderId: string, fillerName?: string) => {
        startTimeRef.current = Date.now();
        orderIdRef.current = orderId;

        posthog?.capture('order_fulfillment_started', {
            orderId,
            startedAt: new Date().toISOString(),
            fillerName,
        });
    };

    const completeFilling = (nextStatus: string, extraProps?: Record<string, any>) => {
        if (!startTimeRef.current || !orderIdRef.current) return;

        const timeToFillSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

        posthog?.capture('order_fulfillment_completed', {
            orderId: orderIdRef.current,
            timeToFillSeconds,
            newStatus: nextStatus,
            completedAt: new Date().toISOString(),
            ...extraProps,
        });

        // reset state
        startTimeRef.current = null;
        orderIdRef.current = null;
    };

    return {
        startFilling,
        completeFilling,
    };
}
