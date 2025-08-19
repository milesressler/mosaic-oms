import { Box, Grid, Paper, Table, Text } from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "@mantine/hooks";
import StatusBadge from "src/components/StatusBadge.tsx";
import { OrderStatus } from "src/models/types.tsx";
import TimeWidget from "src/components/TimeWidget.tsx";
import ShowersWidget from "src/components/showers/ShowersWidget";

const CustomerDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrdersDashboardViewKiosk);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

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

    useEffect(() => {
        setProgress((counter / refreshInterval) * 100);
    }, [counter]);

    useEffect(() => {
        const autoRefresh = setInterval(() => {
            window.location.reload();
        }, 30 * 60 * 1000);
        return () => clearInterval(autoRefresh);
    }, []);

    return (
        <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Main content area above Transit */}
            <Box style={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
                {/* Left: Orders Table */}
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

                {/* Right: TimeWidget + ShowersWidget */}
                <Box style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem", gap: "0.5rem", overflow: "hidden" }}>
                    <Paper
                        shadow="sm"
                        radius="md"
                        withBorder
                        p="md"
                        style={{ flex: "1 1 20%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        <TimeWidget />
                    </Paper>
                    <Box
                        style={{ flex: "1 1 80%", overflowY: "auto" }}
                    >

                    </Box>
                    {/*<Paper*/}
                    {/*    shadow="sm"*/}
                    {/*    radius="md"*/}
                    {/*    withBorder*/}
                    {/*    p="md"*/}
                    {/*    style={{ flex: "1 1 80%", overflowY: "auto" }}*/}
                    {/*>*/}
                    {/*    <ShowersWidget />*/}
                    {/*</Paper>*/}
                </Box>
            </Box>

            {/* Footer: Transit */}
            <Box style={{ borderTop: "1px solid #eee" }}>
                <Transit />
            </Box>
        </Box>
    );
};

export default CustomerDashboard;
