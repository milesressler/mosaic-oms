import {Box, Button} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useEffect, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import QrScannerButton from "src/components/scanner/QrScannerButton.tsx";

export function RunnerDashboard() {
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);
    const [ selectedOrders, setSelectedOrders ] = useState<number[]>([]);
    const [ selectedOrderUuids, setSelectedOrderUuids ] = useState<string[]>([]);
    const updateOrderStatusBulkApi = useApi(ordersApi.updateOrderStatusBulk);

    const triggerTableRefresh = () => {
        setForceRefreshTable(prev => !prev);
    }

    useEffect(() => {
        if (updateOrderStatusBulkApi.data) {
            triggerTableRefresh();
            setSelectedOrders([]);
            setSelectedOrderUuids([]);
        }
    }, [updateOrderStatusBulkApi.data]);

    const onSelectOrder = (order: Order) => {
        setSelectedOrders((prevSelectedOrders) => {
            if (prevSelectedOrders.includes(order.id)) {
                // Remove the order ID if it's already present
                return prevSelectedOrders.filter(id => id !== order.id);
            } else {
                // Add the order ID if it's not present
                return [...prevSelectedOrders, order.id];
            }
        });

        setSelectedOrderUuids((prevSelectedOrders) => {
            if (prevSelectedOrders.includes(order.uuid)) {
                // Remove the order ID if it's already present
                return prevSelectedOrders.filter(uuid => uuid !== order.uuid);
            } else {
                // Add the order ID if it's not present
                return [...prevSelectedOrders, order.uuid];
            }
        });
    }

    function deliverSelected() {
        updateOrderStatusBulkApi.request(selectedOrderUuids, OrderStatus.READY_FOR_CUSTOMER_PICKUP);
    }


    return (
        <Box h={'100%'} w={'100%'} pos={'relative'}>

            <OrdersTable
                statusFilter={[OrderStatus.PACKED, OrderStatus.IN_TRANSIT]}
                view={"runner"}
                onSelectRow={onSelectOrder}
                showProgressIndicator={true}
                forceRefresh={forceRefreshTable}
                selectedOrderIds={selectedOrders}
                maxNumberOfRecords={10}
            />
            <Box pos={'absolute'} bottom={20} right={20}>
                <QrScannerButton
                    label={''}
                    onOrderScanned={({ id, uuid }) => {
                        setSelectedOrders(prev => {
                            return prev.includes(+id) ? prev : [...prev, +id];
                        });

                        setSelectedOrderUuids(prev => {
                                console.log(prev);
                                const n =
                                    prev.includes(uuid) ? prev : [...prev, uuid];
                                console.log(n);
                                return n;
                            }
                        );
                    }}
                />
            </Box>

            <Button
                disabled={ (selectedOrders ?? []).length === 0}
                pos={"absolute"}
                radius={100}
                left={20}
                bottom={20}
                onClick={deliverSelected}>
                Mark Selected as Delivered
            </Button>
        </Box>
    )
}
export default RunnerDashboard;
