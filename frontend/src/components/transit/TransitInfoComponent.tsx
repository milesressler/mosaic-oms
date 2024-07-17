import {TransitInfo} from "src/models/types.tsx";
import {Badge, Center, Group, Paper, Stack, Text} from "@mantine/core";
import { DateTime } from 'luxon';
import { IconBus } from '@tabler/icons-react';
import {useEffect, useState} from "react";


interface TransitInfoComponentProps {
    transitInfo: TransitInfo
}

function getArrivalMessage(nextArrivalTime: number, now: DateTime) {
    const nextArrivalDateTime = DateTime.fromMillis(nextArrivalTime);

    if (nextArrivalDateTime < now) {
        return 'Arrived';
    } else {
        return "Arrives " + nextArrivalDateTime.toRelative({ base: now });
    }
}
export function TransitInfoComponent({transitInfo}: TransitInfoComponentProps) {
    const [currentTime, setCurrentTime] = useState(DateTime.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(DateTime.now());
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (<Paper radius={'md'} shadow="xs" p={30} mb={5} bg={'#f8f8f8'}>
        <Group justify={"space-between"}>

            <div>
                <Center>
            <IconBus size={'40'} />
                { transitInfo.routeId && <Badge ml={10} >{transitInfo.routeId}</Badge> }
                </Center>
            </div>

        <div>
            <Stack>
            <Text span>{transitInfo.stopInfo.stopName} <Text span c={'dimmed'} size={'xs'}>{
                transitInfo.direction === '0' ? 'NB' : 'SB'
            }</Text>
            </Text></Stack>
        </div>
        </Group>

        <div>{getArrivalMessage(transitInfo.nextArrivalTime, currentTime)}</div>
        <div><Text c={'dimmed'} size={'xs'}>{DateTime.fromMillis(transitInfo.nextArrivalTime).toLocaleString(DateTime.TIME_SIMPLE)}</Text></div>

    </Paper>)
}
