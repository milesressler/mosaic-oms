import {Box, Grid, GridCol, Paper, Table, Text} from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "@mantine/hooks";
import StatusBadge from "src/components/StatusBadge.tsx";
import { OrderStatus } from "src/models/types.tsx";
import TimeWidget from "src/components/TimeWidget.tsx";

const CustomerDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrdersDashboardViewKiosk);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const refreshInterval = 30000;
    const refreshPercent = refreshInterval / 100;
    const pageParams = { size: 25 };

    const getObfusgatedStatus = useCallback((status: OrderStatus) => {
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
            {/* Main content scrolls if too tall */}
            <Box style={{ flexGrow: 1, overflow: "hidden" }}>
                <Grid style={{ minHeight: 0 }}>
                    <GridCol span={6}>
                        <Box style={{ paddingRight: "1rem", overflowY: "auto", maxHeight: "100%" }}>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Friend</Table.Th>
                                        <Table.Th align="right">Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    { getOrdersApi.data?.map((order) => (
                                        <Table.Tr key={order.id}>
                                            <Table.Td>
                                                <Text fz={45}>
                                                    {order.customer?.firstName} {(order.customer?.lastName || '')?.[0]}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <StatusBadge size={'lg'}
                                                    orderStatus={getObfusgatedStatus(order.orderStatus)}
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </GridCol>
                    <GridCol span={6} pr={'md'} pt={'md'}>
                        <Paper
                            shadow="sm"        // subtle drop shadow
                            radius="md"        // medium rounded corners
                            withBorder         // 1‑px theme‑colored border
                            p="md"             // Mantine padding token
                            ta="center"
                        >
                        <TimeWidget/>
                        </Paper>
                    </GridCol>
                </Grid>
            </Box>

            {/* Always visible at bottom */}
            <Box style={{ borderTop: "1px solid #eee" }}>
                <Transit />
            </Box>
        </Box>
    );
};

export default CustomerDashboard;
