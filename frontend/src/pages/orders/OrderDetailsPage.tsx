import {useEffect} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';
import {DateTime} from 'luxon';
import { notifications } from '@mantine/notifications';

import {
    Avatar,
    Badge,
    Button,
    Card, Center,
    Container,
    Group, Loader,
    Menu, ScrollArea,
    Stack,
    Table,
    Text,
    Timeline,
    Title,
    Box,
    Paper,
    SimpleGrid,
    ActionIcon,
    useMantineTheme,
} from '@mantine/core';
import {Category, categoryDisplayNames, OrderStatus} from "src/models/types.tsx";
import UserAvatar from 'src/components/common/userAvatar/UserAvatar';
import {IconArrowRight, IconChevronDown, IconCalendar, IconUser, IconNotes, IconPackage, IconClock, IconCheck} from '@tabler/icons-react';
import React from 'react';
import {statusDisplay} from "src/utils/StatusUtils.tsx";
import AttributeBadges from 'src/components/common/items/AttributeBadges';
import classes from "src/styles/LinkStyles.module.css";

// Enhanced status colors
const STATUS_COLORS: Record<string, string> = {
    PENDING_ACCEPTANCE: 'yellow',
    ACCEPTED: 'blue',
    IN_PROGRESS: 'cyan',
    NEEDS_INFO: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red',
    PACKED: 'indigo',
    IN_TRANSIT: 'violet',
    READY_FOR_CUSTOMER_PICKUP: 'teal',
};

export default function OrderDetailsPage() {
    const { id } = useParams();
    const printOrder = useApi(ordersApi.print);
    const getOrder = useApi(ordersApi.getOrderById);
    const updateOrder = useApi(ordersApi.updateOrderStatus);
    const navigate = useNavigate();
    const theme = useMantineTheme();

    useEffect(() => {
        if (id) {
            getOrder.request(Number(id));
        }
    }, [id]);

    const order = getOrder.data;
    const canEdit = order && [OrderStatus.PENDING_ACCEPTANCE, OrderStatus.NEEDS_INFO].indexOf(order.orderStatus) !== -1;
    const canPrint = order && [OrderStatus.PACKED, OrderStatus.IN_TRANSIT].indexOf(order.orderStatus) !== -1;

    const cancel = () => {
        order && updateOrder.request(order.uuid, OrderStatus.CANCELLED)
    }

    const complete = () => {
        order && updateOrder.request(order.uuid, OrderStatus.COMPLETED);
    }

    const edit = () => {
        order && navigate(`/dashboard/taker/${order.id}`);
    };

    const reprint = () => {
        if (order) {
            printOrder.request(order.uuid, OrderStatus.PACKED).then(
                (result) => {
                    if (result?.data) {
                        notifications.show({
                            title: `New label printed`,
                            message: null,
                            autoClose: 3000,
                        });
                    }
                }
            )
        }
    }

    useEffect(() => {
        if (updateOrder.data) {
            getOrder.request(order!.id);
        }
    }, [updateOrder.data]);

    if (getOrder.loading) {
        return <Center style={{ height: '50vh' }}><Loader size="lg" /></Center>;
    }
    if (!order) {
        return <Center style={{ height: '50vh' }}><Text c="red" size="lg">Order not found.</Text></Center>;
    }

    // Group items by category
    const groupedItems = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
        const cat = item.category ?? Category.OTHER;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const totalItems = order.items.reduce((sum, item) => sum + item.quantityRequested, 0);
    const filledItems = order.items.reduce((sum, item) => sum + item.quantityFulfilled, 0);
    const fillPercentage = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;

    return (
        <Container size="lg" py="xs">
            {/* Mobile-first Header Card */}
            <Card shadow="sm" padding="lg" radius="md" mb="md">
                <Stack gap="md">
                    {/* Order Number & Status Row */}
                    <Group justify="space-between" align="flex-start">
                        <Box>
                            <Text size="sm" c="dimmed" mb={4}>
                                Order #{order.id}
                            </Text>
                            <Badge 
                                size="lg" 
                                color={STATUS_COLORS[order.orderStatus] || 'gray'} 
                                variant="light"
                                radius="sm"
                            >
                                {statusDisplay(order.orderStatus)}
                            </Badge>
                        </Box>
                        <Menu>
                            <Menu.Target>
                                <ActionIcon variant="light" size="lg">
                                    <IconChevronDown size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={cancel}>Cancel</Menu.Item>
                                <Menu.Item onClick={complete}>Mark Complete</Menu.Item>
                                <Menu.Item disabled={!canEdit} onClick={edit}>Edit</Menu.Item>
                                <Menu.Item disabled={!canPrint} onClick={reprint}>Print Label</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    {/* Customer Name - Prominent */}
                    <Link to={`/customer/${order.customer.uuid}`} className={classes.noLinkStyle}>
                        <Group gap="xs" style={{ cursor: 'pointer' }}>
                            <IconUser size={20} color={theme.colors.gray[6]} />
                            <Title order={1} size="h2" c="dark">
                                {order.customer.firstName} {order.customer.lastName}
                            </Title>
                            <IconArrowRight size={16} color={theme.colors.blue[6]} />
                        </Group>
                    </Link>

                    {/* Progress Bar for Fulfillment */}
                    <Box>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={500}>Order Fulfillment</Text>
                            <Text size="sm" c="dimmed">{filledItems}/{totalItems} items ({fillPercentage}%)</Text>
                        </Group>
                        <Box style={{ height: 6, backgroundColor: theme.colors.gray[2], borderRadius: 3, overflow: 'hidden' }}>
                            <Box 
                                style={{ 
                                    height: '100%', 
                                    width: `${fillPercentage}%`, 
                                    backgroundColor: fillPercentage === 100 ? theme.colors.green[6] : theme.colors.blue[6],
                                    transition: 'all 0.3s ease'
                                }} 
                            />
                        </Box>
                    </Box>

                    {/* Key Info Grid */}
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Group gap="xs">
                            <IconCalendar size={16} color={.colors.gray[6]} />
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                    Created
                                </Text>
                                <Text size="sm">
                                    {DateTime.fromISO(order.created).toLocaleString(DateTime.DATETIME_MED)}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {DateTime.fromISO(order.created).toRelative()}
                                </Text>
                            </Box>
                        </Group>
                        
                        {order.postedToGroupMe && (
                            <Group gap="xs">
                                <IconPackage size={16} color={theme.colors.green[6]} />
                                <Box>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                        Posted to GroupMe
                                    </Text>
                                    <Text size="sm">
                                        {DateTime.fromISO(order.postedToGroupMe).toRelative()}
                                    </Text>
                                </Box>
                            </Group>
                        )}
                    </SimpleGrid>

                    <Group >
                        <Text  size="sm" c="dimmed">Assignee: </Text>
                        <UserAvatar user={{name: 'Unassigned'}} />
                    </Group>
                </Stack>
            </Card>

            {/* Special Instructions Card */}
            {order.specialInstructions && (
                <Card shadow="sm" padding="md" radius="md" mb="md" bg="blue.0">
                    <Group gap="xs" mb="xs">
                        <IconNotes size={18} color={theme.colors.blue[6]} />
                        <Text size="sm" fw={600} c="blue.8">
                            Special Instructions
                        </Text>
                    </Group>
                    <Text size="sm" c="blue.9">
                        {order.specialInstructions}
                    </Text>
                </Card>
            )}

            {/* Items Card - Mobile Optimized */}
            <Card shadow="sm" padding="lg" radius="md" mb="md">
                <Group gap="xs" mb="md">
                    <IconPackage size={18} color={theme.colors.gray[7]} />
                    <Title order={3} size="h4">
                        Items ({order.items.length})
                    </Title>
                </Group>

                {/* Desktop: Table layout */}
                <Box visibleFrom="md">
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Item</Table.Th>
                                    <Table.Th>Qty</Table.Th>
                                    <Table.Th>Filled</Table.Th>
                                    <Table.Th>Attributes</Table.Th>
                                    <Table.Th>Notes</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {Object.entries(groupedItems).map(([cat, items]) => (
                                    <React.Fragment key={cat}>
                                        <Table.Tr>
                                            <Table.Th colSpan={5} style={{ fontWeight: 600, backgroundColor: theme.colors.gray[0] }}>
                                                {categoryDisplayNames[cat as Category]}
                                            </Table.Th>
                                        </Table.Tr>
                                        {items.map(item => (
                                            <Table.Tr key={item.id}>
                                                <Table.Td>
                                                    <Text fw={500}>{item.description}</Text>
                                                </Table.Td>
                                                <Table.Td style={{ verticalAlign: 'middle' }}>
                                                    <Badge variant="outline" size="md"
                                                           style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                        {item.quantityRequested}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td style={{ verticalAlign: 'middle' }}>
                                                    <Badge 
                                                        variant={item.quantityFulfilled === item.quantityRequested ? 'filled' : 'outline'}
                                                        color={item.quantityFulfilled === item.quantityRequested ? 'green' : 'orange'}
                                                        size="md"
                                                        leftSection={item.quantityFulfilled === item.quantityRequested ? <IconCheck size={8} /> : <IconClock size={8} />}
                                                        style={{ display: 'inline-flex', alignItems: 'center' }}
                                                    >
                                                        {item.quantityFulfilled}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <AttributeBadges attrs={item.attributes}/>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" c={item.notes ? 'dark' : 'dimmed'}>
                                                        {item.notes || '-'}
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Box>

                {/* Mobile: Card-based layout */}
                <Box hiddenFrom="md">
                    <Stack gap="sm">
                        {Object.entries(groupedItems).map(([cat, items]) => (
                            <Box key={cat}>
                                <Text fw={600} size="sm" c="dimmed" tt="uppercase" mb="xs">
                                    {categoryDisplayNames[cat as Category]}
                                </Text>
                                <Stack gap="xs">
                                    {items.map(item => (
                                        <Paper key={item.id} p="md" withBorder radius="sm" bg="gray.0">
                                            <Group justify="space-between" align="center" mb="xs">
                                                <Text fw={500} size="sm">
                                                    {item.description}
                                                </Text>
                                                <Group gap="xs" style={{ flexShrink: 0 }}>
                                                    <Badge variant="outline" size="xs" style={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                                                        {item.quantityRequested}
                                                    </Badge>
                                                    <Text size="xs" c="dimmed">→</Text>
                                                    <Badge 
                                                        variant={item.quantityFulfilled === item.quantityRequested ? 'filled' : 'outline'}
                                                        color={item.quantityFulfilled === item.quantityRequested ? 'green' : 'orange'}
                                                        size="xs"
                                                        leftSection={item.quantityFulfilled === item.quantityRequested ? <IconCheck size={10} /> : <IconClock size={10} />}
                                                        style={{ minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        {item.quantityFulfilled}
                                                    </Badge>
                                                </Group>
                                            </Group>
                                            {Object.keys(item.attributes).length > 0 && (
                                                <Box mb="xs">
                                                    <AttributeBadges attrs={item.attributes}/>
                                                </Box>
                                            )}
                                            {item.notes && (
                                                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                    {item.notes}
                                                </Text>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Card>

            {/* History Timeline Card */}
            <Card shadow="sm" padding="lg" radius="md">
                <Title order={3} size="h4" mb="md">
                    Order History
                </Title>
                <Timeline active={order.history.length - 1} bulletSize={28} lineWidth={2}>
                    {order.history.map((event, idx) => {
                        let label: string;
                        let color: string;

                        if (event.eventType === 'EXPORT') {
                            label = `Exported to ${event.exportType}`;
                            color = 'blue';
                        } else {
                            label = statusDisplay(event.status);
                            color = STATUS_COLORS[event.status] || 'gray';
                        }

                        const timestamp = DateTime.fromISO(event.timestamp);

                        return (
                            <Timeline.Item
                                key={idx}
                                title={label}
                                bullet={<Avatar size={24} src={event.user.avatar} alt={event.user.name} radius="xl" />}
                                color={color}
                            >
                                <Stack gap="xs">
                                    <Group justify="space-between" align="flex-start">
                                        <Stack gap={2}>
                                            <Text size="sm" c="dimmed">
                                                {timestamp.toLocaleString(DateTime.DATETIME_MED)}
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                {timestamp.toRelative()}
                                            </Text>
                                        </Stack>
                                        <Text size="sm" fw={500} c="dark">
                                            {event.user.name}
                                        </Text>
                                    </Group>
                                    {event.comment && (
                                        <Paper p="xs" bg="yellow.1" radius="sm">
                                            <Group gap="xs">
                                                <IconNotes size={14} color={theme.colors.yellow[7]} />
                                                <Text size="sm" style={{ fontStyle: 'italic' }} c="yellow.9">
                                                    "{event.comment}"
                                                </Text>
                                            </Group>
                                        </Paper>
                                    )}
                                </Stack>
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            </Card>
        </Container>
    );
}
