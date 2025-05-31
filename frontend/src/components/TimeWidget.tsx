// src/components/TimeWidget.tsx
import { Box, Text } from "@mantine/core";
import { useEffect, useState } from "react";

const TimeWidget = () => {
    const [now, setNow] = useState(new Date());

    // tick once a second
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1_000);
        return () => clearInterval(id);
    }, []);

    return (
        <Box ta="center" py="md">
            {/* big digital clock */}
            <Text fz={64} fw={700} lh={1}>
                {now.toLocaleTimeString("en-US", {
                    hour: "numeric",      // no leading zero
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                })}
            </Text>

            {/* small date underneath */}
            <Text fz="sm" c="dimmed">
                {now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
            </Text>
        </Box>
    );
};

export default TimeWidget;
