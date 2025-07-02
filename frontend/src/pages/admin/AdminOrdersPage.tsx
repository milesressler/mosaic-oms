import {useNavigate, useSearchParams} from "react-router-dom";
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import {
    Avatar,
    Badge,
    Box,
    Center,
    Group, Image,
    Pagination, rem, Select, Switch,
    Table, Text,
    TextInput, UnstyledButton
} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {IconChevronDown, IconChevronUp, IconPencil, IconSearch, IconSelector, IconX} from "@tabler/icons-react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import groupmeImage from "src/assets/groupme_icon.png";
import StatusBadge from "src/components/StatusBadge.tsx";
import classes from "src/components/orders/TableSort.module.css";
import {statusDisplay} from "src/utils/StatusUtils.tsx";
import QrScannerButton from "src/components/scanner/QrScannerButton.tsx";


interface ThProps {
    field?: string
    children: React.ReactNode;
}

const AdminOrdersPage = () => {

    const navigate = useNavigate();
    const getOrders = useApi(ordersApi.getOrdersWithDetails);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get page from URL or default to 1
    const customerUuidFilter = searchParams.get('customerUuid') || null;
    const page = Number(searchParams.get("page")) || 1;
    const orderId = Number(searchParams.get("orderId")) || '';
    const sortField = searchParams.get("sort") || 'created';
    const reversed = (searchParams.get("direction") || 'desc') === 'desc';
    const statusFilter = searchParams.get("status") || null;
    const onlyMyOrdersFilter = searchParams.get("onlyMyOrders") === "true";
    const customerFilter = searchParams.get("customer") || null;
    const [customerSearchString, setCustomerSearchString] = useState(customerFilter);

    const [debouncedCustomer] = useDebouncedValue(customerSearchString, 300);


    useEffect(() => {
        getOrders.request({
            status: statusFilter,
            page: page - 1,
            orderId: orderId,
            size: 10,
            sort: `${sortField},${reversed ? 'desc' : 'asc'}`,
            customer: customerFilter,
            customerUuid: customerUuidFilter,
            onlyMyOrders: onlyMyOrdersFilter,
        });
    }, [page, sortField, reversed, statusFilter, customerFilter, customerUuidFilter, orderId, onlyMyOrdersFilter]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedCustomer) {
            params.set("customer", debouncedCustomer);
        } else {
            params.delete('customer');
        }
        // Optionally reset page when status filter changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }, [debouncedCustomer]);

    const setOrderId = (orderId: string) => {
        const params = new URLSearchParams(searchParams);
        if (orderId) {
            params.set("orderId", orderId);
        } else {
            params.delete('orderId');
        }
        setSearchParams(params, { replace: true });
    };
    const setPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params, { replace: true });
    };
    const setSort = (field: string, reversed: boolean) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort", field);
        params.set("direction", reversed ? "desc" : "asc");
        // Optionally reset page when sort changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    };

    const setStatusSearch = (orderStatus: string|null) => {
        const params = new URLSearchParams(searchParams);
        if (!orderStatus) {
            params.delete('status');
        } else  {
            params.set("status", orderStatus);
        }
        // Optionally reset page when status filter changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    };
    const setCustomerUuid = (uuid: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (!uuid) {
            params.delete('customerUuid');
        } else {
            params.set('customerUuid', uuid);
        }
        params.set('page', '1'); // reset pagination
        setSearchParams(params, { replace: true });
    };

    const setOnlyMyOrders = (val: boolean) => {
        const params = new URLSearchParams(searchParams);
        console.log(val);
        if (val) {
            params.set('onlyMyOrders', 'true');
        } else {
            params.delete('onlyMyOrders');
        }
        setSearchParams(params, { replace: true });
    }

    function Th({ field, children }: ThProps) {
        const isSorted = field === sortField;
        const Icon = isSorted ? (!reversed ? IconChevronUp : IconChevronDown) : IconSelector;
        return (
            <Table.Th className={classes.th}>
                {field &&
                <UnstyledButton onClick={() => field && setSort(field || '', isSorted ? !reversed : true)}
                    className={classes.control}>
                    <Group justify="space-between">
                        <Text fw={isSorted ? 'bold' : 500} fz="sm">
                            {children}
                        </Text>
                        <Center className={classes.icon}>
                             <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        </Center>
                    </Group>
                </UnstyledButton>
                }
                {!field && <Box className={classes.nosort}>
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                </Box>
                }

            </Table.Th>
        );
    }

    const rows = getOrders.data?.content?.map((order: OrderDetails) => (
        <>
            {/*<LoadingOverlay visible={getOrders.loading}/>*/}
            <Table.Tr key={order.uuid} pos={'relative'} onClick={() =>  navigate(`/order/${order.id}`)} >
                <Table.Td><><Group justify={'flex-start'} gap={5}>
                    <Avatar src={order?.assignee?.avatar}  color={order.assignee && !order.assignee?.avatar ? 'indigo' : ''}  size={'sm'} />
                    <Text size={'sm'} c={order.assignee ? '' : 'dimmed'}>
                        {order.assignee?.name ?? 'Unassigned'}
                    </Text></Group></></Table.Td>
                <Table.Td>{order.id}  { order.postedToGroupMe && <Image w={16} h={16} src={groupmeImage}></Image> } </Table.Td>
                <Table.Td>{order.customer.firstName} {order.customer.lastName}</Table.Td>
                <Table.Td> <>
                    <Text>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                    <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_MED)}</Text>
                </></Table.Td>
                <Table.Td>
                    <div>
                        <StatusBadge orderStatus={order.orderStatus} />
                        <Text c={'dimmed'} size={'xs'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>
                    </div>
                </Table.Td>
                <Table.Td>
                    { [OrderStatus.PENDING_ACCEPTANCE, OrderStatus.NEEDS_INFO].indexOf(order.orderStatus) !== -1 &&
                        <IconPencil style={{cursor: 'pointer'}} color={'gray'} onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/taker/${order.id}`);}}/>
                    }
                </Table.Td>
            </Table.Tr>
        </>
    ));

    return (
        <>
            <Group m="xs" align="end" justify="space-between" wrap="wrap">
                <Group gap="sm">
                    <TextInput
                        // label={"Customer"}
                        placeholder="Search customer name"
                        leftSection={<IconSearch size={16} stroke={1.5} />}
                        value={customerSearchString || ''}
                        onChange={(e) => setCustomerSearchString(e.currentTarget.value)}
                    />
                    <Select
                        // label="Status"
                        data={[OrderStatus.PENDING_ACCEPTANCE, OrderStatus.ACCEPTED, OrderStatus.PACKED, OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.NEEDS_INFO, OrderStatus.CANCELLED, OrderStatus.COMPLETED].map(status => {
                            return { label: statusDisplay(status), value: status.toString() }
                        })}
                        placeholder="Filter by status"
                        value={statusFilter}
                        onChange={(val: string|null) => (setStatusSearch(val))}
                    />
                    <TextInput
                        // label={"Customer"}
                        placeholder="Order ID (Exact match)"
                        leftSection={<IconSearch size={16} stroke={1.5} />}
                        value={orderId || ''}
                        type={'number'}
                        onChange={(e) => setOrderId(e.currentTarget.value)}
                    />
                    <Switch
                        id={'onlyMyOrdersToggle'}
                        label={"Only my orders"}
                      description={"Filters to orders that you've handled"}
                        checked={onlyMyOrdersFilter}
                        onChange={(e) => setOnlyMyOrders(e.currentTarget.checked)}
                        />
                    {customerUuidFilter && (
                        <Badge
                            size={'md'}
                            rightSection={
                                <IconX
                                    size={16}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setCustomerUuid(null)}
                                />
                            }
                            variant="outline"
                            // color="teal"
                        >
                            Customer:
                            <Text span ml={4}>
                                {customerUuidFilter.slice(0, 8)}…
                            </Text>
                        </Badge>
                    )}
                </Group>

                <QrScannerButton onOrderScanned={(order: {id: number, uuid: string}) => {
                    navigate(`/order/${order.id}`);
                }}/>
            </Group>
            <Table pos={'relative'}>
                <Table.Thead>
                    <Table.Tr>
                        <Th key={'assignee'} field={'assignee.name'}>Assignee</Th>
                        <Th
                            key={'id'}
                            field={'id'}>
                            <>Order #</>
                        </Th>
                        <Th key={'customer'} field={'customer.lastName'}>Customer</Th>
                        <Th
                            key={'created'}
                            field={'created'}>
                            <>Created</>
                        </Th>
                        <Th key={'status'}>Status</Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
            { (getOrders.data?.totalPages ?? 0) > 1 && <Center><Pagination value={page} onChange={setPage} total={getOrders.data?.totalPages ?? 0} /></Center> }
        </>
    );
};

export default AdminOrdersPage;
