import {
    Box,
    Group,
    Title,
    Divider,
    Loader,
    Table,
    ActionIcon,
    Tooltip,
    Center,
    Text,
    Card,
    Stack,
    Button,
} from "@mantine/core";
import { IconTrash, IconPlayerPlay, IconUserPlus, IconInfoCircle } from "@tabler/icons-react";
import useApi from "src/hooks/useApi";
import showersApi from "src/services/showersApi";
import { ShowerReservationResponse } from "src/models/types";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import AddToShowerQueueModal from "src/components/showers/AddToShowerQueueModal.tsx";
import {getEstimatedWaitTime, getWaitEstimates} from "src/util/ShowerUtils.tsx";

const STALL_COUNT = 2;


export function ShowersDashboard() {
    const getShowersApi = useApi(showersApi.getShowerQueue);

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [now, setNow] = useState(DateTime.now());

    const getRemainingTime = (endTime?: string | null): string => {
        if (!endTime) return "-";
        const diff = DateTime.fromISO(endTime).diff(now, ["minutes", "seconds"]);
        if (diff.toMillis() <= 0) return "Done";
        return `${Math.floor(diff.minutes)}m ${Math.floor(diff.seconds % 60)}s`;
    };

    const handleEndShower = async (id: string) => {
        await showersApi.endShower(id);
        await getShowersApi.request();
    };
    useEffect(() => {
        const updateNow = () => setNow(DateTime.now());
        updateNow(); // initial
        const interval = setInterval(updateNow, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        getShowersApi.request();
        const interval = setInterval(() => getShowersApi.request({ silent: true }), 15000);
        return () => clearInterval(interval);
    }, []);

    const { data, loading, error } = getShowersApi;
    if (loading && !data) {
        return (
            <Center h="300px">
                <Loader />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="300px">
                <Group>
                    <IconInfoCircle size={20} />
                    <Text c="red">Failed to load shower queue. Please try again later.</Text>
                </Group>
            </Center>
        );
    }

    const active = data?.active ?? [];
    const queued = data?.queued ?? { content: [] };
    const estimates = getWaitEstimates(active, queued.content.length);


    const getStall = (n: number): ShowerReservationResponse | null =>
        active.find((r) => r.showerNumber === n) || null;

    const renderStallCard = (stallNumber: number) => {
        const res = getStall(stallNumber);

        return (
            <Card shadow="sm" padding="md" radius="md" withBorder w="100%">
                <Group justify="space-between" mb="xs">
                    <Title order={4}>Stall #{stallNumber}</Title>
                </Group>
                {res ? (
                    <Stack gap={2}>
                        <Text fw={500}>{res.customer.displayName}</Text>
                        <Text size="sm" c="dimmed">
                            Started: {new Date(res.startedAt!).toLocaleTimeString()}
                        </Text>
                        <Text size="sm">Time Left: {getRemainingTime(res.endTime)}</Text>
                        <Group justify="flex-end" mt="xs">
                            <Button
                                size="xs"
                                variant="outline"
                                color="red"
                                onClick={() => handleEndShower(res.uuid)}
                            >
                                End Shower
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Text c="dimmed" fs="italic">
                        Unoccupied
                    </Text>
                )}
            </Card>
        );
    };

    return (
        <Box p="lg">
            <Group justify="space-between" mb="md">
                <Title order={3}>Showers</Title>
            </Group>

            <Group grow mb="lg">
                {Array.from({ length: STALL_COUNT }, (_, i) => renderStallCard(i + 1))}
            </Group>

            {active.length < STALL_COUNT && queued?.content?.length > 0 && (
                <Card withBorder mb="lg" bg="yellow.1">
                    <Group justify="space-between">
                        <Text>
                            A stall is available —{" "}
                            <Text span fw={500}>
                                {queued?.content[0].customer.displayName}
                            </Text>{" "}
                            is next in line.
                        </Text>
                        <Button
                            leftSection={<IconPlayerPlay size={16} />}
                            size="xs"
                            onClick={async () => {
                                const next = queued.content[0];
                                if (!next) return;
                                await showersApi.startShower(next.uuid, active.length + 1); // assign to next open stall
                                await getShowersApi.request();
                            }}
                        >
                            Start Now
                        </Button>
                    </Group>
                </Card>
            )}

            <Divider my="md" />

            <Group justify="space-between" mb="sm">
                <Title order={4}>Waiting Queue</Title>
                <Button
                    variant="outline"
                    size="xs"
                    leftSection={<IconUserPlus size={14} />}
                    onClick={() => setAddModalOpen(true)}
                >
                    Add to Queue
                </Button>
            </Group>

            <Table striped highlightOnHover withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Position</Table.Th>
                        <Table.Th>WaitTime</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {queued.content.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={3}>
                                <Text c="dimmed" ta="center">
                                    No one is currently waiting.
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        queued.content.map((r: ShowerReservationResponse) => (
                            <Table.Tr key={r.uuid}>
                                <Table.Td>{r.customer.displayName}</Table.Td>
                                <Table.Td>{queued.content.indexOf(r) + 1}</Table.Td>
                                <Table.Td>{estimates[queued.content.indexOf(r)].readable}</Table.Td>

                                <Table.Td>
                                    <Group gap="xs">
                                        <Tooltip label="Start Shower">
                                            <ActionIcon variant="light" color="blue" size="sm">
                                                <IconPlayerPlay size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Cancel Reservation">
                                            <ActionIcon variant="light" color="red" size="sm">
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
            <AddToShowerQueueModal opened={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => getShowersApi.request()}/>
        </Box>
    );
}

export default ShowersDashboard;
