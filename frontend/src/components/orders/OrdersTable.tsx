import {Order, OrderStatus} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {useInterval} from "@mantine/hooks";
import {Center, Group, rem, RingProgress, Table, Text, UnstyledButton} from "@mantine/core";
import {DateTime} from "luxon";
import StatusBadge from "src/components/StatusBadge.tsx";
import {IconChevronDown, IconChevronUp, IconSelector} from "@tabler/icons-react";
import classes from './TableSort.module.css';
import {ColumnConfig, columns} from "src/components/orders/OrdersTableConfig.tsx";


interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort?(): void;
}

interface OrdersTable {
    view: string,
    onSelectRow?: (order: Order) => void,
    selectedOrderId?: number,
    refreshInterval?: number,
    allowPagination?: boolean,
    showProgressIndicator?: boolean,
    autoRefresh?: boolean,
    showFilters?: boolean,
    forceRefresh?: boolean,
    statusFilter?: OrderStatus[],
    sorting?: boolean,
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
        <Table.Th className={classes.th}>
            <UnstyledButton onClick={onSort} className={classes.control}>
                <Group justify="space-between">
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                    { onSort &&
                    <Center className={classes.icon}>
                        <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </Center>
                    }
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}


export function OrdersTable({
        view = 'default',
        refreshInterval = 30000,
        onSelectRow,
        selectedOrderId,
        allowPagination = false,
        showProgressIndicator = false,
        autoRefresh = true,
        showFilters = false,
        statusFilter = [],
        forceRefresh,
        sorting,
}: OrdersTable){
    const refreshPercent = refreshInterval/100;

    const getOrdersApi = useApi(ordersApi.getOrders);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const [sortBy, setSortBy] = useState<string | null>('created');
    const [reverseSortDirection, setReverseSortDirection] = useState(true);

    const visibleColumns = columns.filter(column => column.views?.includes(view));



    const refreshOrders: () => void = () =>
        getOrdersApi.request({
            status: statusFilter?.join(","),
            sort: `${sortBy},${reverseSortDirection ? 'desc' : 'asc'}`
        });



    const interval = useInterval(() => {
        setCounter(prevCounter => {
            const newCounter = prevCounter + refreshPercent; // Update every 100ms
            if (newCounter >= refreshInterval) {
                !getOrdersApi.loading && refreshOrders()
                return 0; // Reset counter after reaching refresh interval
            }
            return newCounter;
        });
    }, refreshPercent);

    useEffect(() => {
        setProgress((counter / refreshInterval) * 100);
    }, [counter]);

    useEffect(() => {
        autoRefresh && interval.start();
        refreshOrders()
    }, []);

    useEffect(() => {
        refreshOrders();
        setCounter(0);
    }, [forceRefresh]);

    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        refreshOrders();
    };

    const getObfusgatedStatus = (status: OrderStatus) => {
        const inProgressStatuses = [
            OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.PACKING,
            OrderStatus.IN_TRANSIT,
        ]

        return inProgressStatuses.indexOf(status) == -1 ? status : OrderStatus.ACCEPTED;
    }

    const rows = getOrdersApi.data?.content?.map((order: Order) => (
        <Table.Tr  style={{cursor: onSelectRow ? 'pointer' : ''}}
                   key={order.uuid}
                   bg={order.id === selectedOrderId ? '#F3f3f3' : ""}
                   onClick={() => onSelectRow && onSelectRow(order)}
        >
            {visibleColumns.map((column: ColumnConfig,  index: number) =>{
                const key = column.id ?? column.label;
             return (
                <Table.Td key={key} colSpan={index === visibleColumns.length - 1 ? 2 : 1}>
                    {key === 'Order #' && order.id}
                    {key === 'Created' && <>
                        <Text>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                        <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_FULL)}</Text>
                    </>}
                    {key === 'Updated' && <Text c={'dimmed'}>{DateTime.fromISO(order.lastStatusUpdate).toRelative()}</Text>}
                    {key === 'Status' && <StatusBadge orderStatus={order.orderStatus} />}
                    {key === 'Customer' && order.customer?.name}
                    {key === 'statusObfuscated' && <StatusBadge orderStatus={getObfusgatedStatus(order.orderStatus)}/> }
                </Table.Td>
            )})}
        </Table.Tr>
    ));

    return (
        <>
            <Table style={{ position: 'relative' }}>
                <Table.Thead style={{ backgroundColor: '#f7f7f7', color: '#555' }}>
                    <Table.Tr>
                        {visibleColumns.map((column: ColumnConfig) => (
                            <Th
                                key={column.id ?? column.label }
                                sorted={sortBy === column.sortField}
                                reversed={reverseSortDirection}
                                onSort={column.sortField ? () => column.sortField && setSorting(column.sortField) : undefined}                            >
                                {column.label}
                            </Th>
                        ))}
                        { showProgressIndicator && autoRefresh &&
                            <Table.Th>
                                <Group justify={"flex-end"}>
                                <RingProgress
                                    size={25}
                                    thickness={2}
                                    sections={[
                                        {
                                            value: Math.min(100, progress),
                                            color: 'rgba(' + (255 - Math.min(100, progress) / 100 * 254) + ',255, ' + (255 - Math.min(100, progress) / 100 * 254) + ',  1)'
                                        }]}>
                                </RingProgress>
                                </Group>
                            </Table.Th>
                        }
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>



            </Table>

            {/*<Pagination value={activePage} onChange={setPage} total={adminItemsApi.data?.totalPages ? adminItemsApi.data?.totalPages : 1} />*/}
        </>
    );
}

export default OrdersTable
