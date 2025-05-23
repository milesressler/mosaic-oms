import {Box, Button, DEFAULT_THEME, Grid, GridCol, rem, Tabs} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useMediaQuery} from "@mantine/hooks";
import { useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {useEffect, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";

export function RunnerDashboard() {
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const { id } = useParams();
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);
    const { forceRefresh, selectedOrder } = useSelectedOrder();
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

    const orderTable = <><OrdersTable
        statusFilter={[OrderStatus.PACKED, OrderStatus.IN_TRANSIT]}
        view={"runner"}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefreshTable}
        selectedOrderIds={selectedOrders}
        maxNumberOfRecords={10}
    ></OrdersTable>
    { (selectedOrders?.length || 0 > 0) &&
        <Button pos={"absolute"} radius={100} right={10} bottom={30} onClick={deliverSelected}>Mark Selected as Delivered</Button>}
    </>;


    const orderDetailSection = <OrderDetailSection onUpdate={triggerTableRefresh}/>;

    return (
        <SelectedOrderProvider>
            <Box pos={"relative"}>
                { isMobile && <Tabs defaultValue="gallery">

                <Tabs.Panel value="gallery">
                    {orderTable}
                </Tabs.Panel>

                <Tabs.Panel value="messages">
                    {/*{  outlet}*/}
                    {selectedOrder && orderDetailSection}
                </Tabs.Panel>

                <Tabs.Panel value="settings">
                    Settings tab content
                </Tabs.Panel>
            </Tabs> }
                {!isMobile &&
            <Grid gutter={25}>
                <GridCol span={{base: 12, lg:  !!id ? 6 : 12}}>
                    {orderTable}
                </GridCol>
                <GridCol span={6} visibleFrom={'lg'}>
                    {/*{  outlet}*/}
                    {selectedOrder && orderDetailSection}
                </GridCol>
            </Grid>
                }
        </Box>
    </SelectedOrderProvider>
    )
}
export default RunnerDashboard;
