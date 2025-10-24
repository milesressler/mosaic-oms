import {useEffect} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';
import {DateTime} from 'luxon';
import { notifications } from '@mantine/notifications';

import {
    Avatar,
    Badge, Box,
    Button,
    Card, Center,
    Container,
    Divider,
    Group, Loader,
    Menu, Paper, ScrollArea, SimpleGrid,
    Stack,
    Table,
    Text,
    Timeline,
    Title, useMantineTheme,
} from '@mantine/core';
import {Category, categoryDisplayNames, OrderStatus} from "src/models/types.tsx";
import UserAvatar from 'src/components/common/userAvatar/UserAvatar';
import {IconArrowRight, IconCalendar, IconChevronDown, IconNotes, IconPackage, IconTrash, IconCheck, IconArrowLeft, IconEdit, IconPrinter} from '@tabler/icons-react';
import React from 'react';
import {statusDisplay} from "src/utils/StatusUtils.tsx";
import GroupedAttributeBadges from 'src/components/common/items/GroupedAttributeBadges';
import classes from "src/styles/LinkStyles.module.css";

// Basic status label and color mappings

const STATUS_COLORS: Record<string, string> = {
    PENDING_ACCEPTANCE: 'gray',
    ACCEPTED: 'blue',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'green',
    CANCELLED: 'red',
};

export default function OrderDetailsPageOld() {
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
    const canReturn = OrderStatus.PACKED === order?.orderStatus;

    const cancel = () => {
        order && updateOrder.request(order.uuid, OrderStatus.CANCELLED)
    }

    const returnToFiller = () => {
        order && updateOrder.request(order.uuid, OrderStatus.ACCEPTED)
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
        return <Center><Loader></Loader></Center>;
    }
    if (!order) {
        return <Center><Text c="red">Order not found.</Text></Center>;
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
                        <Menu.Item leftSection={<IconTrash size={16} />} onClick={cancel}>Cancel</Menu.Item>
                        <Menu.Item leftSection={<IconCheck size={16} />} onClick={complete}>Mark Complete</Menu.Item>
                        <Menu.Item leftSection={<IconArrowLeft size={16} />}  disabled={!canReturn} onClick={returnToFiller}>Return to Filler</Menu.Item>
                        <Menu.Item leftSection={<IconEdit size={16} />} disabled={!canEdit} onClick={edit}>Edit</Menu.Item>
                        <Menu.Item leftSection={<IconPrinter size={16} />} disabled={!canPrint} onClick={reprint}>Print Completed Label</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Group justify="apart" mb="md">
                <Stack gap={0}>

                    <Link
                        to={`/customer/${order.customer.uuid}`}
                        className={classes.noLinkStyle}
                    >
                        <Title order={2}>
                            {order.customer.firstName} {order.customer.lastName}
                        </Title>
                        <IconArrowRight size={18} stroke={1.5} />
                    </Link>
                </Stack>
                <Badge color={STATUS_COLORS[order.orderStatus] || 'gray'} variant="light">
                    {statusDisplay(order.orderStatus)}
                </Badge>
            </Group>





            {/* Key Info Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Group gap="xs">
                    <IconCalendar size={16} color={theme.colors.gray[6]} />
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

            {/* Assignee */}
            {/*{order.assignee ? (<>*/}
                    <Group mt={'sm'}>
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
            <Group justify={'space-between'} mb={'xs'}>
            </Group>
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
                                            <GroupedAttributeBadges 
                                                attrs={item.attributes}
                                                itemAttributes={item.item.attributes}
                                            />
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

                        </Timeline.Item>
                    );
                })}
            </Timeline>
        </Container>
    );
}
