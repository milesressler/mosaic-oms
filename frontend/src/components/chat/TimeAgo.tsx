import { Text } from '@mantine/core';
import { DateTime } from 'luxon';
import { useState, useEffect, useRef } from 'react';

interface TimeAgoProps {
  timestamp: string;
  size?: string;
  color?: string;
  mt?: string;
}

export default function TimeAgo({ timestamp, size = "xs", color = "dimmed", mt }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState(() => DateTime.fromISO(timestamp).toRelative());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateTimeAgo = () => {
      const newTimeAgo = DateTime.fromISO(timestamp).toRelative();
      setTimeAgo(newTimeAgo);
    };

    // Update immediately
    updateTimeAgo();

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up interval to update every second
    intervalRef.current = setInterval(updateTimeAgo, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timestamp]);

  return (
    <Text size={size} c={color} mt={mt}>
      {timeAgo}
    </Text>
  );
}