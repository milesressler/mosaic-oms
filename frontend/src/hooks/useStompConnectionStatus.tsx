import { useEffect, useState } from 'react';
import { useStompClient } from 'react-stomp-hooks';

export function useStompConnectionStatus(pollInterval = 500) {
    const client = useStompClient();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!client) {
            setConnected(false);
            return;
        }

        const interval = setInterval(() => {
            // Defensive check to avoid stale client
            setConnected(client?.connected ?? false);
        }, pollInterval);

        // Set immediately on mount
        setConnected(client.connected ?? false);

        return () => clearInterval(interval);
    }, [client, pollInterval]);

    return connected;
}
