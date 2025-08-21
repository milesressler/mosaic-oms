import { Box, Button, Card, Divider, Group, Menu, Stack, Table, Text, Title} from "@mantine/core";
import useApi from "src/hooks/useApi";
import showersApi from "src/services/showersApi";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { ReservationStatus, StallStatus } from "src/models/types";
import AddToShowerQueueModal from "src/components/showers/AddToShowerQueueModal";
import {IconChevronDown, IconUserPlus} from "@tabler/icons-react";

export function ShowersDashboard() {
    const getShowersApi = useApi(showersApi.getShowerQueue);
    const [now, setNow] = useState(() => DateTime.now());
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Update current time every second for timers
    useEffect(() => {
        const interval = setInterval(() => setNow(DateTime.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch stalls and queue
    useEffect(() => {
        getShowersApi.request();
        const interval = setInterval(() => getShowersApi.request({ silent: true }), 10000);
        return () => clearInterval(interval);
    }, []);

    const { data, loading } = getShowersApi;
    if (loading && !data) return null;

    const stalls = data?.stalls || [];
    const queue = data?.queue || [];
    const firstAvailableStall = stalls.find((s) => !s.reservation)?.stallNumber;


    const renderStallCard = (stall: StallStatus) => {
        const { stallNumber, status, reservation, availableAt } = stall;
        const isOverdue = DateTime.fromISO(reservation?.endTime || availableAt) < now;

        const diff = DateTime.fromISO(reservation?.endTime || availableAt).diff(now, ["minutes", "seconds"]);
        const minutes = Math.floor(diff.as("minutes"));
        const seconds = Math.floor(diff.seconds % 60);
        const timeText = isOverdue
            ? `Over time since ${DateTime.fromISO(reservation!.endTime!).toRelative()}`
            : `Time left: ${minutes}m ${seconds}s`;

        return (
            <Card key={stallNumber} shadow="sm" padding="md" radius="md" withBorder w="100%">
                <Group justify="space-between" mb="xs">
                    <Title order={4}>Stall #{stallNumber}</Title>
                </Group>

                {reservation ? (
                    <Stack gap={2}>
                        <Text fw={500}>{reservation.customer.displayName}</Text>
                        <Text size="sm" c="dimmed">Status: {status}</Text>

                        {status === ReservationStatus.IN_USE && (
                            <>
                                <Text size="sm" c={isOverdue ? "red" : undefined}>{timeText}</Text>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    color="red"
                                    onClick={async () => {
                                        await showersApi.endShower(reservation.uuid);
                                        await getShowersApi.request();
                                    }}
                                >
                                    End Shower
                                </Button>
                            </>
                        )}

                        {status === ReservationStatus.READY && (
                            <Button
                                size="xs"
                                variant="filled"
                                color="blue"
                                onClick={async () => {
                                    await showersApi.startShower(reservation.uuid);
                                    await getShowersApi.request();
                                }}
                            >
                                Start Shower
                            </Button>
                        )}

                        {/* Cancel option for active or in-use reservations */}
                        {(status === ReservationStatus.READY) && (
                            <Button
                                size="xs"
                                variant="outline"
                                color="red"
                                onClick={async () => {
                                    await showersApi.cancelReservation(reservation.uuid);
                                    await getShowersApi.request();
                                }}
                            >
                                Cancel Reservation
                            </Button>
                        )}
                    </Stack>
                ) : (
                    <Stack align="center" gap={4}>
                        <Text c="dimmed" fs="italic">Available</Text>
                        {queue.length > 0 && (
                            <Button
                                size="xs"
                                variant="outline"
                                color="blue"
                                onClick={async () => {
                                    const next = queue[0];
                                    await showersApi.showerReady(next.uuid, stallNumber);
                                    await getShowersApi.request();
                                }}
                            >
                                Assign Next In Line
                            </Button>
                        )}
                    </Stack>
                )}
            </Card>
        );
    };

    return (
        <Box p="lg">
            <Group justify="space-between" mb="md">
                <Title order={3}>Current Showers</Title>
            </Group>

            <Group grow mb="lg">
                {stalls.map(renderStallCard)}
            </Group>

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

            <Table striped withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Ready in:</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {queue.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={3} ta="center" c="dimmed">
                                No one is currently waiting.
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        queue.map((entry) => (
                            <Table.Tr key={entry.uuid}>
                                <Table.Td>{entry.customer.displayName}</Table.Td>
                                <Table.Td>{entry.readyNow ? 'Now' : DateTime.fromISO(entry.estimatedStart).toRelative({ base: now })}</Table.Td>
                                <Table.Td>
                                    <Group justify="space-between" w="100%">
                                        {(() => {
                                            const availableStalls = stalls
                                                .filter((s) => !s.reservation)
                                                .map((s) => s.stallNumber)
                                                .sort((a, b) => a - b); // optional: stable order

                                            if (availableStalls.length === 1) {
                                                const only = availableStalls[0];
                                                return (
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        onClick={async () => {
                                                            await showersApi.showerReady(entry.uuid, only);
                                                            await getShowersApi.request();
                                                        }}
                                                    >
                                                        Assign to Stall #{only}
                                                    </Button>
                                                );
                                            }

                                            if (availableStalls.length >= 2) {
                                                const defaultStall = availableStalls[0]; // or choose your heuristic
                                                return (
                                                    <Button.Group>
                                                        <Button
                                                            size="xs"
                                                            variant="light"
                                                            onClick={async () => {
                                                                await showersApi.showerReady(entry.uuid, defaultStall);
                                                                await getShowersApi.request();
                                                            }}
                                                        >
                                                            Auto-assign
                                                        </Button>

                                                        <Menu position="bottom-end" shadow="md" withinPortal>
                                                            <Menu.Target>
                                                                <Button
                                                                    size="xs"
                                                                    variant="light"
                                                                    style={{
                                                                        borderTopLeftRadius: 0,
                                                                        borderBottomLeftRadius: 0
                                                                    }}
                                                                >
                                                                    <IconChevronDown size={14} />
                                                                </Button>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                {availableStalls.map((stallNo) => (
                                                                    <Menu.Item
                                                                        key={stallNo}
                                                                        onClick={async () => {
                                                                            await showersApi.showerReady(entry.uuid, stallNo);
                                                                            await getShowersApi.request();
                                                                        }}
                                                                    >
                                                                        Stall #{stallNo}
                                                                    </Menu.Item>
                                                                ))}
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Button.Group>

                                                );
                                            }

                                            // no open stalls
                                            return null;
                                        })()}


                                        <Button
                                            size="xs"
                                            variant="outline"
                                            color="red"
                                            onClick={async () => {
                                                await showersApi.cancelReservation(entry.uuid);
                                                await getShowersApi.request();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Group>
                                </Table.Td>

                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>

            <AddToShowerQueueModal
                opened={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={() => getShowersApi.request()}
            />
        </Box>
    );
}

export default ShowersDashboard;
