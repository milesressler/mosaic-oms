import { useEffect } from 'react';

/**
 * Custom hook to disable pull-to-refresh behavior on mobile devices
 * Applies CSS properties to prevent overscroll behavior when component mounts
 * and restores original behavior on cleanup
 */
export function usePullToRefreshDisabled() {
    useEffect(() => {
        // Store original values to restore later
        const originalBodyOverscroll = document.body.style.overscrollBehavior;
        const originalBodyTouchAction = document.body.style.touchAction;
        const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
        const originalHtmlTouchAction = document.documentElement.style.touchAction;

        // Disable pull-to-refresh
        document.body.style.overscrollBehavior = 'none';
        document.body.style.touchAction = 'manipulation';
        document.documentElement.style.overscrollBehavior = 'none';
        document.documentElement.style.touchAction = 'manipulation';
        
        return () => {
            // Restore original values
            document.body.style.overscrollBehavior = originalBodyOverscroll;
            document.body.style.touchAction = originalBodyTouchAction;
            document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
            document.documentElement.style.touchAction = originalHtmlTouchAction;
        };
    }, []);
}