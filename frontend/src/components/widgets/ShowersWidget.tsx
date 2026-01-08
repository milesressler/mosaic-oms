import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import {Customer, ReservationStatus, StallStatus} from "src/models/types";
import {Box, Card, Group, Table, Text, Title} from "@mantine/core";
import showersApi from "src/services/showersApi.tsx";

export const ShowersWidget = () => {
    const getShowersApi = useApi(showersApi.getPublicShowerQueue);
    const [now, setNow] = useState(() => DateTime.now());

    useEffect(() => {
        getShowersApi.request();
        const interval = setInterval(() => {
            setNow(DateTime.now());
            getShowersApi.request({ silent: true });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const { data, loading } = getShowersApi;
    if (loading && !data) return null;

    const stalls = data?.stalls || [];
    const queue = data?.queue || [];

    const getStallStatusLabel = (status: ReservationStatus | undefined) => {
        switch (status) {
            case ReservationStatus.IN_USE:
                return <Text fw={800} c={'dimmed'}>Occupied</Text> ;
            case ReservationStatus.READY:
                return <Text fw={800} c={'green'}>Ready</Text>;
            default:
                return <Text fw={400} c={'dimmed'}>Preparing...</Text>;
        }
    };

    const renderStallCard = (stall: StallStatus) => {
        const { stallNumber, reservation } = stall;
        return (
            <Card key={stallNumber} shadow="sm" padding="xs" radius="md" withBorder w="100%">
                <Title order={4}>Shower Stall #{stallNumber}</Title>
                <Text size="lg" mt="xs">
                    {getStallStatusLabel(reservation?.status)} {reservation && reservation.status == ReservationStatus.READY && <Text size={'xl'}>
                    {getShortName(reservation.customer)}
                    </Text>}
                </Text>
            </Card>
        );
    };

    const getShortName = (customer: Customer) => {
        return [customer?.firstName, (customer?.lastName || '')?.[0]]
            .filter(s => s?.trim().length > 0)
            .join(' ')
    };

    return (
        <Box>
            {/*<Title order={3}></Title>*/}
            <Group grow mb="md">
                {stalls.map(renderStallCard)}
            </Group>

            <Title order={4} mb="sm">Waiting Queue</Title>
            <Table striped withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Estimated Start</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {queue.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={2} ta="center" c="dimmed">
                                No one is currently waiting.
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        queue.map((entry) => (
                            <Table.Tr key={entry.uuid}>
                                <Table.Td>
                                    <Text size={'36px'}>
                                    {getShortName(entry.customer)}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size={'36px'}>
                                        {entry.readyNow ? 'Now' : DateTime.fromISO(entry.estimatedStart).toRelative({ base: now })}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
        </Box>
    );
}

export default ShowersWidget;
