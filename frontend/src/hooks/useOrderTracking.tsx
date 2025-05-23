import { usePostHog } from 'posthog-js/react';
import { useRef } from 'react';

export function useOrderTracking() {
    const posthog = usePostHog();
    const orderIdRef = useRef<string | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const startOrder = (orderId?: string) => {
        const id = orderId ?? crypto.randomUUID();
        orderIdRef.current = id;
        startTimeRef.current = Date.now();

        posthog?.capture('order_funnel_started', {
            orderId: id,
            startedAt: new Date().toISOString(),
        });
    };

    const trackStep = (stepName: string, props?: Record<string, any>) => {
        if (!orderIdRef.current) return;
        posthog?.capture(stepName, {
            orderId: orderIdRef.current,
            ...props,
        });
    };

    const itemAdded = (itemName: string, props?: Record<string, any>) => {
        if (!orderIdRef.current) return;
        posthog?.capture("order_funnel_item_added", {
            orderId: orderIdRef.current,
            itemName,
            ...props,
        });
    };

    const completeOrder = (extraProps?: Record<string, any>) => {
        const now = Date.now();
        if (!orderIdRef.current || !startTimeRef.current) return;

        const timeToCompleteMs = now - startTimeRef.current;

        posthog?.capture('order_funnel_completed', {
            orderId: orderIdRef.current,
            timeToCompleteMs,
            timeToCompleteSeconds: Math.round(timeToCompleteMs / 1000),
            completedAt: new Date().toISOString(),
            ...extraProps,
        });

        // Clear for safety
        orderIdRef.current = null;
        startTimeRef.current = null;
    };

    return {
        startOrder,
        trackStep,
        completeOrder,
        itemAdded,
    };
}
