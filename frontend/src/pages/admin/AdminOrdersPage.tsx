import {useNavigate, useSearchParams} from "react-router-dom";
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import {
    Avatar,
    Box,
    Center,
    Group, Image,
    Pagination, rem, Select,
    Table, Text,
    TextInput, UnstyledButton
} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {IconChevronDown, IconChevronUp, IconSearch, IconSelector} from "@tabler/icons-react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import groupmeImage from "src/assets/groupme_icon.png";
import StatusBadge from "src/components/StatusBadge.tsx";
import classes from "src/components/orders/TableSort.module.css";
import {statusDisplay} from "src/util/StatusUtils.tsx";
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
    const page = Number(searchParams.get("page")) || 1;
    const sortField = searchParams.get("sort") || 'created';
    const reversed = (searchParams.get("direction") || 'desc') === 'desc';
    const statusFilter = searchParams.get("status") || null;
    const customerFilter = searchParams.get("customer") || null;
    const [customerSearchString, setCustomerSearchString] = useState(customerFilter);

    const [debouncedCustomer] = useDebouncedValue(customerSearchString, 300);


    useEffect(() => {
        getOrders.request({
            status: statusFilter,
            page: page - 1,
            size: 10,
            sort: `${sortField},${reversed ? 'desc' : 'asc'}`,
            customer: customerFilter
        });
    }, [page, sortField, reversed, statusFilter, customerFilter]);

    useEffect(() => {

        const params = new URLSearchParams(searchParams);
        params.set("customer", debouncedCustomer || '');
        // Optionally reset page when status filter changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }, [debouncedCustomer]);

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
            </Table.Tr>
        </>
    ));

    return (
        <>
            <Group m="xs" align="end" justify="space-between" wrap="wrap">
                <Group gap="sm">
                    <TextInput
                        // label={"Customer"}
                        placeholder="Search by customer"
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
