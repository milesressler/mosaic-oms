import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';

export function usePageTracking() {
    const location = useLocation();
    const posthog = usePostHog();
    const prevPath = useRef<string | null>(null);

    useEffect(() => {
        const page = location.pathname + location.search;

        if (prevPath.current && prevPath.current !== page) {
            posthog?.capture('$pageleave', {
                from: prevPath.current,
                to: page,
            });
        }

        posthog?.capture('$pageview', {
            current_url: page,
        });

        prevPath.current = page;
    }, [location]);
}
