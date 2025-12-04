import {Order, OrderDetails, OrderNotification, OrderStatus} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {useDisclosure, useInterval} from "@mantine/hooks";
import {
    Center,
    Group,
    Image,
    Pagination,
    rem,
    Table,
    Text,
    UnstyledButton
} from "@mantine/core";
import {DateTime} from "luxon";
import StatusBadge from "src/components/StatusBadge.tsx";
import {IconChevronDown, IconChevronUp, IconSelector} from "@tabler/icons-react";
import classes from './TableSort.module.css';
import {ColumnConfig, columns, OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import groupmeImage from "src/assets/groupme_icon.png";
import UserAvatar from "src/components/common/userAvatar/UserAvatar.tsx";
import {useSubscription} from "react-stomp-hooks";
import {AssigneeAvatar} from "src/components/orders/AssigneeAvatar.tsx";
import {RefreshIndicator} from "src/components/common/RefreshIndicator.tsx";

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
    showSecondsRemaining?: boolean,
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
        showSecondsRemaining = true,
        autoRefresh = true,
        statusFilter = [],
        forceRefresh,
        disableSorting = false,
}: OrdersTable){
    const refreshPercent = refreshInterval/100;

    const getOrdersApi = useApi(ordersApi.getOrdersWithDetails);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);
    const [orders, setOrders] = useState<OrderDetails[]>([]);

    const [sortBy, setSortBy] = useState<string | null>('created');
    const [activePage, setActivePage] = useState(0);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const visibleColumns = columns.filter(column => column.views?.includes(view) || column.views?.includes(OrdersView.DEFAULT));

    const refreshOrders: () => void = () => {
        let params: any = {
            status: statusFilter?.join(","),
            sort: `${sortBy},${reverseSortDirection ? 'desc' : 'asc'}`,
            page: activePage,
            size: maxNumberOfRecords,
        };
        if (maxNumberOfRecords) {
            params = {...params, size: maxNumberOfRecords};
        }

        getOrdersApi.request(params);
    }

    const handleManualRefresh = () => {
        if (!getOrdersApi.loading) {
            refreshOrders();
            setCounter(0);
        }
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
    }, []);

    useEffect(() => {
        refreshOrders();
        setCounter(0);
    }, [forceRefresh]);

    useEffect(() => {
        if (getOrdersApi?.data && getOrdersApi?.data?.number !== activePage) {
            refreshOrders();
        }
    }, [activePage]);

    useEffect(() => {
        if ( view === OrdersView.PUBLIC) {
            setOrders(getOrdersApi.data ?? []);
        } else {
            setOrders(getOrdersApi.data?.content ?? [])
        }
    }, [getOrdersApi.data]);


    useSubscription("/topic/orders/assignee", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        setOrders((prevOrders) =>
            prevOrders.map((order) => {
                    return `${order.id}` === `${body.order.id}`
                        ? {
                            ...order,
                            assignee: body.assignee, // update the assignee
                        }
                        : order
                }
            )
        );
    });


    useSubscription("/topic/orders/status", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        const remove = statusFilter?.length > 0 && (statusFilter?.indexOf(body.order.orderStatus) === -1);
        if (remove) {
            setOrders((prevOrders) =>
                prevOrders.filter((order) => {
                   return `${order.id}` !== `${body.order.id}`
                })
            );
            return;
        }
        setOrders((prevOrders) =>
            prevOrders.map((order) => {
                    return `${order.id}` === `${body.order.id}`
                        ? {
                            ...order,
                            orderStatus: body.orderStatus, // update the assignee
                        }
                        : order
                }
            )
        );
    });

    const setSorting = (field: string) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        refreshOrders();
    };

    const rows = orders?.map((order: Order) => (
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
                    {key === 'assigned' &&
                        <UserAvatar lastInitial user={assigned ? assigned : {name: "Unassigned"}}/>
                    }
                    {key === '#' && <>{order.id}{order.postedToGroupMe && <Image w={16} h={16} src={groupmeImage}></Image>}</>}
                    {key === 'Created' && <>
                        <Text size={'sm'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                        <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_MED)}</Text>
                    </>}
                    {key === 'Updated' && <Text c={'dimmed'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>}
                    {key === 'Status' && <div>
                        <StatusBadge variant={'outline'} orderStatus={order.orderStatus} />
                        <Text c={'dimmed'} size={'xs'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>
                    </div>}
                    {key === 'filler' &&
                        <UserAvatar user={order.lastStatusChange?.user}/>
                  }
                    {key === 'Customer' && `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()}
                </Table.Td>
            )})}
        </Table.Tr>
    ));

    return (
        <>
            <Table style={{ position: 'relative' }}>
                <Table.Thead>
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
                                <RefreshIndicator 
                                    progress={progress}
                                    onRefresh={handleManualRefresh}
                                    showSecondsRemaining={showSecondsRemaining}
                                    refreshInterval={refreshInterval}
                                />
                            </Table.Th>
                        }
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>



            </Table>

            { allowPagination && <Pagination value={activePage + 1}
                                             onChange={(val) =>  setActivePage(val-1)}
                                             disabled={getOrdersApi.loading}
                                             total={getOrdersApi?.data?.totalPages ? getOrdersApi.data?.totalPages : 1} /> }
        </>
    );
}

export default OrdersTable
