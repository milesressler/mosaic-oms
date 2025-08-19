import {
    ActionIcon,
    Box,
    Button,
    Card,
    Center,
    Divider,
    Grid,
    Group, LoadingOverlay,
    Skeleton,
    Stack, Switch,
    Text,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import {IconBath, IconEdit, IconShoppingCart, IconUser} from '@tabler/icons-react';
import {useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { DateTime } from 'luxon';

import useApi from 'src/hooks/useApi';
import CustomersApi from 'src/services/customersApi';
import OrdersApi from 'src/services/ordersApi';
import {Customer, Order} from 'src/models/types.tsx';
import StatusBadge from 'src/components/StatusBadge.tsx';
import {DateInput} from "@mantine/dates";

const CustomerDetailPage = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const customerRequest = useApi(CustomersApi.getCustomer);
    const updateCustomerRequest = useApi(CustomersApi.updateCustomer);
    const ordersRequest = useApi(OrdersApi.getOrders);
    const theme = useMantineTheme();

    const [customer, setCustomer] = useState<Customer|null>(null);

    const [isEditingWaiver, setIsEditingWaiver] = useState(false);
    const [waiverDate, setWaiverDate] = useState<Date>(new Date());
    const navigate = useNavigate();

    const handleStartEdit = () => {
        setIsEditingWaiver(true);
        setWaiverDate(new Date()); // default to today
    };

    const handleCancelEdit = () => {
        setIsEditingWaiver(false);
    };

    const handleSaveWaiver = () => {
        updateCustomerRequest.request(uuid!, {showerWaiverSigned: waiverDate});
        setIsEditingWaiver(false);
    };

    useEffect(() => {
        if (uuid) {
            customerRequest.request(uuid);
            ordersRequest.request({ customerUuid: uuid, size: 3 });
        }
    }, [uuid]);

    useEffect(() => {
        if (customerRequest.data) {
            setCustomer(customerRequest.data);
        }

    }, [customerRequest.data]);

    useEffect(() => {
        if (updateCustomerRequest.data) {
            setCustomer(updateCustomerRequest.data);
        }

    }, [updateCustomerRequest.data]);



    const orders = ordersRequest.data?.content || [];

    const updateEligibility = (checked: boolean) => {
        updateCustomerRequest.request(customer!.uuid, {flagged: checked});
    }

    const updateHiddenName = (checked: boolean) => {
        updateCustomerRequest.request(customer!.uuid, {obfuscateName: checked});
    }

    if (customerRequest.loading) {
        return <Skeleton height={200} />;
    }

    if (customerRequest.error) {
        return (
            <Center>
                <Text c="red">Failed to load customer.</Text>
            </Center>
        );
    }

    if (!customer) return null;

    const created = DateTime.fromMillis(customer.created);
    const waiver = customer.showerWaiverCompleted
        ? DateTime.fromMillis(customer.showerWaiverCompleted)
        : null;

    return (
        <Stack gap="md" px="xs" m={'xs'}>
            <Grid gutter="md" pos={'relative'}>
                <LoadingOverlay visible={updateCustomerRequest.loading} />

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card
                        withBorder
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        style={{
                            backgroundColor:
                                customer.flagged ? '#fff4f4' : '#f9f9fb',
                        }}
                    >
                        <Group>
                            <IconUser size={18} />
                            <Text fw={600} size="sm">
                                {customer.displayName}
                            </Text>
                        </Group>
                        <Divider my={'xs'}/>
                        <Grid gutter="xs" align="center">
                            <Grid.Col span={6}>
                                <Text size="sm" fw={500}>
                                    First Seen
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" ta={'right'}>
                                    {created.toLocaleString(DateTime.DATE_MED)}
                                </Text>
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <Text size="sm" fw={500} >
                                    Flagged
                                </Text>
                                <Text size="sm" fw={500} >
                                    Keep name private
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Group justify="flex-end">
                                <Tooltip
                                    label="Toggle this if the friend should not currently receive services due to a prior issue"
                                    withArrow
                                >
                                    <Switch
                                        size="md"
                                        checked={customer.flagged}
                                        onChange={(e) =>
                                            updateEligibility(e.currentTarget.checked)
                                        }
                                    />
                                </Tooltip>
                                </Group>
                                <Group justify="flex-end">
                                <Tooltip
                                    label="Toggle this if the friend prefers their name hidden from the dashboard"
                                    withArrow
                                >
                                    <Switch
                                        size="md"
                                        checked={customer.obfuscatedName}
                                        onChange={(e) =>
                                            updateHiddenName(e.currentTarget.checked)
                                        }
                                    />
                                </Tooltip>
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card
                        withBorder
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        style={{ backgroundColor: '#f9f9fb' }}
                    >

                        <Group>
                            <IconBath size={18} />
                            <Text fw={600} size="sm">Showers</Text>
                        </Group>
                        <Divider my="xs" />

                        {!isEditingWaiver ? (
                            <Group justify="space-between" align="center">
                                <Text size="sm">
                                    <strong>Waiver Signed:</strong>{' '}
                                    {waiver
                                        ? `${waiver.toLocaleString(DateTime.DATE_MED)}`
                                        : 'Not yet completed'}
                                </Text>

                                <Tooltip label={waiver ? 'Edit waiver date' : 'Mark waiver as completed'} withArrow>
                                    <ActionIcon variant="light" size="sm" onClick={handleStartEdit}>
                                        <IconEdit size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        ) : (
                            <Stack gap="xs" mt="sm">
                                <DateInput
                                    label="Waiver Date"
                                    value={waiverDate}
                                    onChange={setWaiverDate}
                                    maxDate={new Date()}
                                    required
                                />
                                <Group gap="sm">
                                    <Button size="xs" onClick={handleSaveWaiver}>Save</Button>
                                    <Button variant="subtle" size="xs" onClick={handleCancelEdit}>Cancel</Button>
                                </Group>
                            </Stack>
                        )}
                    </Card>

                </Grid.Col>
            </Grid>

            <Divider
                label={
                    <Group gap={4}>
                        <IconShoppingCart size={16} />
                        <Text fw={600} size="sm" c={theme.black}>
                            Recent Orders
                        </Text>
                    </Group>
                }
                labelPosition="center"
            />

            <Card withBorder shadow="sm" padding="lg" radius="md" style={{ backgroundColor: '#f9f9fb' }}>


                {ordersRequest.loading ? (
                    <Stack gap="sm">
                        {[...Array(3)].map((_, idx) => (
                            <Skeleton height={30} radius="sm" key={idx} />
                        ))}
                    </Stack>
                ) : ordersRequest.error ? (
                    <Text c="red">Failed to load orders.</Text>
                ) : (ordersRequest.data?.totalElements ?? 0) > 0 ? (
                    <>
                    <Stack gap="sm">
                        {orders.map((order: Order) => {
                            const created = DateTime.fromISO(order.created);
                            const updated = DateTime.fromISO(order.lastStatusUpdate);

                            return (
                                <Box
                                    key={order.uuid}
                                    p="sm"
                                    style={{
                                        border: '1px solid #eee',
                                        borderRadius: 8,
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <Stack gap={2} style={{ flex: 1 }}>
                                            <Text fw={500} c={theme.black}>
                                                Order #{order.id}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                Created {created.toLocaleString(DateTime.DATE_MED)}
                                            </Text>
                                            <Tooltip label={updated.toLocaleString(DateTime.DATETIME_MED)} withArrow>
                                                <Text size="xs" c="dimmed">
                                                    Last updated {updated.toRelative()}
                                                </Text>
                                            </Tooltip>
                                        </Stack>
                                        <StatusBadge orderStatus={order.orderStatus} />
                                    </Group>
                                </Box>
                            );
                        })}
                    </Stack>
                    { (ordersRequest.data?.totalElements ?? 0) > 3 && <Group justify="end" mt="sm">
                        <Button variant="default" size="xs"
                        onClick={() => navigate(`/orders?customerUuid=${customer.uuid}`)}>
                            View All {ordersRequest.data?.totalElements}
                        </Button>
                    </Group>
                    }</>

                ) : (
                    <Text size="sm" c="dimmed">
                        No orders found for this customer.
                    </Text>
                )}
            </Card>

        </Stack>
    );
};

export default CustomerDetailPage;
