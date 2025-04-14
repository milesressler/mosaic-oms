import { OrderStatus} from "src/models/types.tsx";
import {Grid, GridCol, Table} from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useCallback, useEffect, useState} from "react";
import {useInterval} from "@mantine/hooks";
import StatusBadge from "src/components/StatusBadge.tsx";

const CustomerDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrdersDashboardViewKiosk);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const refreshInterval = 30000;
    const refreshPercent = refreshInterval/100;
    const pageParams = {
        size: 25,
    };

    const getObfusgatedStatus = useCallback((status: OrderStatus) => {
        const inProgressStatuses = [
            OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.PACKED,
            OrderStatus.IN_TRANSIT,
        ]

        return inProgressStatuses.indexOf(status) == -1 ? status : OrderStatus.IN_PROGRESS;
    }, []);

    const interval = useInterval(() => {
        setCounter(prevCounter => {
            const newCounter = prevCounter + refreshPercent; // Update every 100ms
            if (newCounter >= refreshInterval) {
                !getOrdersApi.loading && getOrdersApi.request(pageParams);
                return 0; // Reset counter after reaching refresh interval
            }
            return newCounter;
        });
    }, refreshPercent);

    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(interval); // cleanup on unmount
    }, []);

    useEffect(() => {
        setProgress((counter / refreshInterval) * 100);
    }, [counter]);

    useEffect(() => {
        interval.start();
        getOrdersApi.request(pageParams);
    }, []);

    return (<Grid>
        <GridCol span={8}>
            <Table>
                <Table.Thead>
                    <Table.Tr key={'headerRow'}>
                        <Table.Th key={'friend'}>
                            Friend
                        </Table.Th>
                        <Table.Th key={'status'} align={'right'}>
                            Status
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {getOrdersApi.data?.map(order => <Table.Tr key={order.id}>
                        <Table.Td>
                            { order.customer?.firstName} {order.customer?.lastName}
                        </Table.Td>
                        <Table.Td>
                            <StatusBadge orderStatus={getObfusgatedStatus(order.orderStatus)}/>
                        </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </GridCol>
        <GridCol span={4} p={'md'}>
            <Transit/>
        </GridCol>

        </Grid>);
}

export default CustomerDashboard;
