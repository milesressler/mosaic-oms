import {Order, OrderDetails, OrderStatus} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {useInterval} from "@mantine/hooks";
import {Avatar, Center, Group, Image, rem, RingProgress, Table, Text, UnstyledButton} from "@mantine/core";
import {DateTime} from "luxon";
import StatusBadge from "src/components/StatusBadge.tsx";
import {IconChevronDown, IconChevronUp, IconSelector} from "@tabler/icons-react";
import classes from './TableSort.module.css';
import {ColumnConfig, columns, OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import groupmeImage from "src/assets/groupme_icon.png";

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    sortingEnabled: boolean;
    onSort?(): void;
}

interface OrdersTable {
    view: OrdersView,
    onSelectRow?: (order: Order) => void,
    selectedOrderIds?: number[],
    refreshInterval?: number,
    allowPagination?: boolean,
    showProgressIndicator?: boolean,
    autoRefresh?: boolean,
    showFilters?: boolean,
    forceRefresh?: boolean,
    disableSorting?: boolean,
    statusFilter?: OrderStatus[],
    maxNumberOfRecords?: number
}

function Th({ children, reversed, sorted, onSort, sortingEnabled }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
        <Table.Th className={classes.th}>
            <UnstyledButton onClick={() => { if (sortingEnabled && onSort) { onSort() }}} className={classes.control}>
                <Group justify="space-between">
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                    { sortingEnabled && onSort &&
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
        selectedOrderIds,
        allowPagination = false,
        maxNumberOfRecords,
        showProgressIndicator = false,
        autoRefresh = true,
        showFilters = false,
        statusFilter = [],
        forceRefresh,
        disableSorting = false,
}: OrdersTable){
    const refreshPercent = refreshInterval/100;

    const getOrdersApi =
        view === OrdersView.PUBLIC ? useApi(ordersApi.getOrdersDashboardView) : useApi(ordersApi.getOrdersWithDetails);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const [sortBy, setSortBy] = useState<string | null>('created');
    const [reverseSortDirection, setReverseSortDirection] = useState(true);

    const visibleColumns = columns.filter(column => column.views?.includes(view) || column.views?.includes(OrdersView.DEFAULT));



    const refreshOrders: () => void = () => {
        let params: any = {
            status: statusFilter?.join(","),
            sort: `${sortBy},${reverseSortDirection ? 'desc' : 'asc'}`
        };
        if (maxNumberOfRecords) {
            params = {...params, size: maxNumberOfRecords};
        }

        getOrdersApi.request(params);
    }



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
            OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.PACKED,
            OrderStatus.IN_TRANSIT,
        ]

        return inProgressStatuses.indexOf(status) == -1 ? status : OrderStatus.IN_PROGRESS;
    }

    const data = view === OrdersView.PUBLIC ? getOrdersApi.data : getOrdersApi.data?.content;
    const rows = data?.map((order: Order) => (
        <Table.Tr  style={{cursor: onSelectRow ? 'pointer' : ''}}
                   key={order.uuid}
                   bg={selectedOrderIds && selectedOrderIds.indexOf(order.id) != -1 ? '#F3f3f3' : ""}
                   onClick={() => onSelectRow && onSelectRow(order)}
        >
            {visibleColumns.map((column: ColumnConfig,  index: number) =>{
                const key = column.id ?? column.label;
                const assigned = ((order as OrderDetails)?.assignee);
             return (
                <Table.Td key={key} colSpan={index === visibleColumns.length - 1 ? 2 : 1}>
                    {key === 'assigned' && <><Group justify={'flex-start'} gap={5}>
                        <Avatar src={assigned?.avatar}  color={assigned && !assigned.avatar ? 'indigo' : ''}  size={'sm'} />
                        <Text size={'sm'} c={assigned ? '' : 'dimmed'}>
                            {assigned?.name ?? 'Unassigned'}
                        </Text></Group></>}
                    {key === 'Order #' && <>{order.id}{order.postedToGroupMe && <Image w={16} h={16} src={groupmeImage}></Image>}</>}
                    {key === 'Created' && <>
                        <Text>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                        <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_MED)}</Text>
                    </>}
                    {key === 'Updated' && <Text c={'dimmed'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>}
                    {key === 'Status' && <div>
                        <StatusBadge orderStatus={order.orderStatus} />
                        <Text c={'dimmed'} size={'xs'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>
                    </div>}
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
                                sortingEnabled={!disableSorting}
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
