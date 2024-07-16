import {Order, OrderStatus} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {useInterval} from "@mantine/hooks";
import {Group, Loader, Overlay, Pagination, Pill, RingProgress, Table, Text} from "@mantine/core";
import {DateTime} from "luxon";
import StatusBadge from "src/components/StatusBadge.tsx";

interface OrdersTable {
    view: string,
    onSelectRow?: (order: Order) => void,
    refreshInterval?: number,
    allowPagination?: boolean,
    showProgressIndicator?: boolean,
    autoRefresh?: boolean,
    showFilters?: boolean,
    forceRefresh?: boolean,
    statusFilter?: OrderStatus[],
}
export function OrdersTable({
        view,
        refreshInterval = 10000,
        onSelectRow,
        allowPagination = false,
        showProgressIndicator = false,
        autoRefresh = true,
        showFilters = false,
        statusFilter = [],
        forceRefresh,

}: OrdersTable){
    const refreshPercent = refreshInterval/100;

    const getOrdersApi = useApi(ordersApi.getOrders);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const refreshOrders: () => void = () =>
        getOrdersApi.request({status: statusFilter?.join(",")});


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


    const rows = getOrdersApi.data?.content?.map((order: Order) => (
        <Table.Tr key={order.uuid} onClick={() => onSelectRow && onSelectRow(order)}>
            <Table.Td>{order.id}</Table.Td>
            {getOrdersApi.loading}
            <Table.Td>
                <Text>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_FULL)}</Text>
            </Table.Td>
            <Table.Td>
                <Text c={'dimmed'} size={'sm'}>{DateTime.fromISO(order.lastStatusUpdate).toRelative()}</Text>
            </Table.Td>
            <Table.Td>
                <StatusBadge orderStatus={order.orderStatus}/>
            </Table.Td>
            <Table.Td colSpan={2}>{order.customer?.name} </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Table style={{ position: 'relative' }}>
                <Table.Thead style={{ backgroundColor: '#f7f7f7', color: '#555' }}>
                    <Table.Tr>
                        <Table.Th>Order #</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Updated</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Customer</Table.Th>
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
