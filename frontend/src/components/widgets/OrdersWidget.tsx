import { Box, Table, Text } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "@mantine/hooks";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import StatusBadge from "src/components/StatusBadge.tsx";
import { OrderStatus } from "src/models/types.tsx";

const OrdersWidget = () => {
    const getOrdersApi = useApi(ordersApi.getOrdersDashboardViewKiosk);
    const [counter, setCounter] = useState(0);

    const refreshInterval = 30000;
    const refreshPercent = refreshInterval / 100;
    const pageParams = { size: 25 };

    const getObfuscatedStatus = useCallback((status: OrderStatus) => {
        const inProgressStatuses = [
            OrderStatus.ACCEPTED,
            OrderStatus.PACKING,
            OrderStatus.PACKED,
            OrderStatus.IN_TRANSIT,
        ];
        return inProgressStatuses.includes(status)
            ? OrderStatus.IN_PROGRESS
            : status;
    }, []);

    const interval = useInterval(() => {
        setCounter((prev) => {
            const next = prev + refreshPercent;
            if (next >= refreshInterval) {
                !getOrdersApi.loading && getOrdersApi.request(pageParams);
                return 0;
            }
            return next;
        });
    }, refreshPercent);

    useEffect(() => {
        interval.start();
        getOrdersApi.request(pageParams);
        return () => interval.stop();
    }, []);

    return (
        <Box pt={'xs'} style={{ flex: 1, overflowY: "auto", padding: "xs" }}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Friend</Table.Th>
                        <Table.Th align="right">Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {getOrdersApi.data?.map((order) => (
                        <Table.Tr key={order.id}>
                            <Table.Td>
                                <Text fz={45}>
                                    {order.customer?.obfuscatedName ? "Guest" :
                                        <>{order.customer?.firstName} {(order.customer?.lastName || '')?.[0]}</>}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <StatusBadge
                                    size="lg"
                                    orderStatus={getObfuscatedStatus(order.orderStatus)}
                                />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Box>
    );
};

export default OrdersWidget;