import {TransitInfo} from "src/models/types.tsx";
import {Badge, Center, Group, Paper, Stack, Text} from "@mantine/core";
import { DateTime } from 'luxon';
import { IconBus, IconCheck } from '@tabler/icons-react';
import {useEffect, useState} from "react";


interface TransitInfoComponentProps {
    transitInfo: TransitInfo
}

function getArrivalData(nextArrivalTime: number, now: DateTime) {
    const nextArrivalDateTime = DateTime.fromMillis(nextArrivalTime);
    const diffInMinutes = Math.round(nextArrivalDateTime.diff(now, "minutes").minutes);
    const hasArrived = nextArrivalDateTime <= now;

    return {
        hasArrived,
        diffInMinutes: Math.max(0, diffInMinutes),
        arrivalTime: nextArrivalDateTime,
    };
}

export function TransitInfoComponent({ transitInfo }: TransitInfoComponentProps) {
    const [currentTime, setCurrentTime] = useState(DateTime.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(DateTime.now());
        }, 500);

        return () => clearInterval(interval);
    }, []);
    const { hasArrived, diffInMinutes, arrivalTime } = getArrivalData(
        transitInfo.nextArrivalTime,
        currentTime
    );

    return (
        <Paper
            radius="md"
            shadow="xs"
            px={'xl'}
            bg="#f2f2f2"
            w="100%" // <-- This makes it stretch
            key={transitInfo.stopId}
        >
            <Group justify="space-between"
                   h={84}>
                <Center>
                    <IconBus size={40} style={{transform: transitInfo.direction === '1' ? "scaleX(-1)" : ''}}  />
                    {transitInfo.routeId && <Badge ml={10}>{transitInfo.routeId}</Badge>}
                </Center>
                <Stack gap={0} align="center">
                    <Text fz="sm" c="dimmed">
                        {hasArrived ? "Arrived" : "Arrives in"}
                    </Text>
                    {hasArrived ? (
                        <IconCheck size={32}  />
                    ) : (
                        <Text fz={52} fw={600} lh={1}>
                            {diffInMinutes}m
                        </Text>
                    )}
                </Stack>
                {/*<Text fz="48" lh="md">{getArrivalData(transitInfo.nextArrivalTime, currentTime).diffInMinutes}</Text>*/}

                <Stack gap={0} align="flex-end">
                    <Text span>
                        {transitInfo.stopInfo.stopName}{" "}
                        <Text span c="dimmed" size="xs">
                            {transitInfo.direction === "0" ? "NB" : "SB"}
                        </Text>
                    </Text>
                    <Text c="dimmed" size="s">
                        {DateTime.fromMillis(transitInfo.nextArrivalTime).toLocaleString(
                            DateTime.TIME_SIMPLE
                        )}
                    </Text>
                </Stack>
            </Group>
        </Paper>
    );
}
