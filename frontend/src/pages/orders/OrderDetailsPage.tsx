import {useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';
import {DateTime} from 'luxon';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Container,
    Divider,
    Group,
    Menu, ScrollArea,
    Stack,
    Table,
    Text,
    Timeline,
    Title,
} from '@mantine/core';
import {Category, categoryDisplayNames, OrderStatus} from "src/models/types.tsx";
import UserAvatar from 'src/components/common/userAvatar/UserAvatar';
import {IconChevronDown} from '@tabler/icons-react';
import React from 'react';
import {statusDisplay} from "src/util/StatusUtils.tsx";
import AttributeBadges from 'src/components/common/items/AttributeBadges';

interface OrderDetailsProps {
    id: string;
}

// Basic status label and color mappings

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
    const updateOrder = useApi(ordersApi.updateOrderStatus);

    useEffect(() => {
        if (id) {
            getOrder.request(Number(id));
        }
    }, [id]);

    const order = getOrder.data;

    const cancel = () => {
        order && updateOrder.request(order.uuid, OrderStatus.CANCELLED)
    }

    const complete = () => {
        order && updateOrder.request(order.uuid, OrderStatus.COMPLETED);
    }

    useEffect(() => {
        if (updateOrder.data) {
            getOrder.request(order!.id);
        }
    }, [updateOrder.data]);

    if (getOrder.loading) {
        return <Text>Loading order details...</Text>;
    }
    if (!order) {
        return <Text c="red">Order not found.</Text>;
    }

    // Group items by category
    const groupedItems = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
        const cat = item.category ?? Category.OTHER;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <Container size="md" py="lg">
            {/* Header */}
            <Group justify="space-between" align="flex-end">

                <Text size="md" c="dimmed">
                    Order #{order.id}
                </Text>
                <Menu>
                    <Menu.Target>
                        <Button size="sm" rightSection={<IconChevronDown size={14} />}>Actions</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={cancel}>Cancel</Menu.Item>
                        <Menu.Item onClick={complete}>Mark Complete</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Group justify="apart" mb="md" align="flex-end">
                <Stack gap={0}>
                    <Link style={{ textDecoration: 'none' }}
                           to={`/customer/${order.customer.uuid}`}>
                        <Title style={{cursor: 'pointer'}} order={2} mt={4}>
                            {order.customer.firstName} {order.customer.lastName}
                        </Title>
                    </Link>
                </Stack>
                <Badge color={STATUS_COLORS[order.orderStatus] || 'gray'} variant="light">
                    {statusDisplay(order.orderStatus)}
                </Badge>
            </Group>



            {/* Timestamps */}
            <Text size="sm" c="dimmed">
                Created:{' '}
                {DateTime.fromISO(order.created).toLocaleString(DateTime.DATETIME_MED)}
            </Text>
            {order.postedToGroupMe && (
                <Text size="sm" c="dimmed" mt="xs">
                    Posted to GroupMe:{' '}
                    {DateTime.fromISO(order.postedToGroupMe).toRelative()}
                </Text>
            )}

            {/* Assignee */}
            {/*{order.assignee ? (<>*/}
                    <Group>
                        <Text  size="sm" c="dimmed">Assignee: </Text>
                        <UserAvatar user={{name: 'Unassigned'}} />
                    </Group>
            {/*    </>*/}
            {/*) : (*/}
            {/*    <Text size="sm" c="dimmed" mb="lg" mt="md">Unassigned</Text>*/}
            {/*)}*/}

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
                <ScrollArea>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Item</Table.Th>
                            {/*<Table.Th>Category</Table.Th>*/}
                            <Table.Th>#</Table.Th>
                            <Table.Th>Filled</Table.Th>
                            <Table.Th>Attributes</Table.Th>
                            <Table.Th>Notes</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {Object.entries(groupedItems).map(([cat, items]) => (
                            <React.Fragment key={cat}>
                                {/* Category header row with distinct background */}
                                <Table.Tr>
                                    <Table.Th  pl={'md'} colSpan={5} style={{ fontWeight: 600, backgroundColor: '#eee' }} >
                                        {categoryDisplayNames[cat as Category]}
                                    </Table.Th>
                                </Table.Tr>
                                {/* Item rows indented under category */}
                                {items.map(item => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td pl={'xl'}>
                                            {item.description}
                                        </Table.Td>
                                        <Table.Td>{item.quantityRequested}</Table.Td>
                                        <Table.Td>{item.quantityFulfilled}</Table.Td>
                                        <Table.Td>
                                            <AttributeBadges attrs={item.attributes}/>
                                        </Table.Td>
                                        <Table.Td>{item.notes || '-'}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </Table.Tbody>
                </Table>
                </ScrollArea>
            </Card>

            {/* History Timeline */}
            <Title order={4} mb="sm">
                Status History
            </Title>
            <Timeline active={order.history.length - 1} bulletSize={24} lineWidth={2}>
                {order.history.map((event, idx) => {

                    // Determine label and color
                    let label: string;
                    let color: string;

                    if (event.eventType === 'EXPORT') {
                        label = `Exported to ${event.exportType}`;
                        color = 'blue';
                    } else {
                        label = statusDisplay(event.status);
                        color = STATUS_COLORS[event.status] || 'gray';
                    }

                    const timestamp = DateTime.fromISO(event.timestamp).toLocaleString(DateTime.DATETIME_MED);

                    return (
                        <Timeline.Item
                            key={idx}
                            title={label}
                            bullet={<Avatar size={20} src={event.user.avatar} alt={event.user.name} radius="xl" />}
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
