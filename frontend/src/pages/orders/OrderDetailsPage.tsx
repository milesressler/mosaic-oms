import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';
import { DateTime } from 'luxon';
import {
    Container,
    Title,
    Text,
    Group,
    Badge,
    Table,
    Card,
    Stack,
    Divider,
    Timeline,
    Avatar,
} from '@mantine/core';

interface OrderDetailsProps {
    id: string;
}

// Basic status label and color mappings
const STATUS_LABELS: Record<string, string> = {
    PENDING_ACCEPTANCE: 'Pending Acceptance',
    ACCEPTED: 'Accepted',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
    PENDING_ACCEPTANCE: 'gray',
    ACCEPTED: 'blue',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'green',
    CANCELLED: 'red',
};

export default function OrderDetailsPage() {
    const { id } = useParams<OrderDetailsProps>();
    const getOrder = useApi(ordersApi.getOrderById);

    useEffect(() => {
        if (id) {
            getOrder.request(Number(id));
        }
    }, [id]);

    const order = getOrder.data;

    if (getOrder.loading) {
        return <Text>Loading order details...</Text>;
    }
    if (!order) {
        return <Text color="red">Order not found.</Text>;
    }

    return (
        <Container size="md" py="lg">
            {/* Header */}
            <Group justify="apart" mb="md" align="flex-end">
                <Stack gap={0}>
                    <Text size="sm" color="dimmed">
                        Order #{order.id}
                    </Text>
                    <Title order={2} mt={4}>
                        {order.customer.firstName} {order.customer.lastName}
                    </Title>
                </Stack>
                <Badge color={STATUS_COLORS[order.orderStatus] || 'gray'} variant="light">
                    {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </Badge>
            </Group>

            {/* Timestamps */}
            <Text size="sm" color="dimmed">
                Created:{' '}
                {DateTime.fromISO(order.created).toLocaleString(DateTime.DATETIME_MED)}
            </Text>
            {order.postedToGroupMe && (
                <Text size="sm" color="dimmed" mt="xs">
                    Posted to GroupMe:{' '}
                    {DateTime.fromISO(order.postedToGroupMe).toRelative()}
                </Text>
            )}

            <Divider my="md" />

            {/* Special Instructions */}
            {order.specialInstructions && (
                <Stack mb="lg">
                    <Title order={4}>Special Instructions</Title>
                    <Text>{order.specialInstructions}</Text>
                </Stack>
            )}

            {/* Items Table */}
            <Title order={4} mb="sm">
                Items Requested
            </Title>
            <Card withBorder mb="lg">
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Category</Table.Th>
                            <Table.Th>Requested</Table.Th>
                            <Table.Th>Fulfilled</Table.Th>
                            <Table.Th>Notes</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {order.items.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td>{item.description}</Table.Td>
                                <Table.Td>{item.category}</Table.Td>
                                <Table.Td>{item.quantityRequested}</Table.Td>
                                <Table.Td>{item.quantityFulfilled}</Table.Td>
                                <Table.Td>{item.notes || '-'}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>

            {/* History Timeline */}
            <Title order={4} mb="sm">
                Status History
            </Title>
            <Timeline active={order.history.length - 1} bulletSize={24} lineWidth={2}>
                {order.history.map((event, idx) => {
                    const label = STATUS_LABELS[event.status] || event.status;
                    const color = STATUS_COLORS[event.status] || 'gray';
                    const timestamp = DateTime.fromISO(event.timestamp).toLocaleString(DateTime.DATETIME_MED);
                    const initials = event.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();

                    return (
                        <Timeline.Item
                            key={idx}
                            title={label}
                            bullet={<Avatar size={24}>{initials}</Avatar>}
                            color={color}
                        >
                            <Text size="sm" c="dimmed">
                                {timestamp} by {event.user.name}
                            </Text>
                        </Timeline.Item>
                    );
                })}
            </Timeline>
        </Container>
    );
}
