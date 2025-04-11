import { OrderStatus} from "src/models/types.tsx";
import {Grid, GridCol, Table} from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {useInterval} from "@mantine/hooks";
import StatusBadge from "src/components/StatusBadge.tsx";

const CustomerDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrdersDashboardViewKiosk);
    const [counter, setCounter] = useState(0);
    const [progress, setProgress] = useState(0);

    const refreshInterval = 30000;
    const refreshPercent = refreshInterval/100;


    const getObfusgatedStatus = (status: OrderStatus) => {
        const inProgressStatuses = [
            OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.PACKED,
            OrderStatus.IN_TRANSIT,
        ]

        return inProgressStatuses.indexOf(status) == -1 ? status : OrderStatus.IN_PROGRESS;
    }
    const refreshOrders: () => void = () => {
        getOrdersApi.request({
            size: 25,
        });
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
        interval.start();
        refreshOrders();
    }, []);

    return (<Grid>
        <GridCol span={8}>
            <Table>
                <Table.Thead>
                    <Table.Th>
                        Friend
                    </Table.Th>
                    <Table.Th align={'right'}>
                        Status
                    </Table.Th>
                </Table.Thead>
                <Table.Tbody>
                    {getOrdersApi.data?.map(order => <Table.Tr>
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
