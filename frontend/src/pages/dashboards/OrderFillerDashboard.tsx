import {Grid, GridCol, rem, Tabs} from "@mantine/core";
import {useState} from "react";
import {Order, OrderStatus} from "src/models/types.tsx";
import AssignedOrderSection from "src/components/fillers/AssignedOrderSection.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import { DEFAULT_THEME } from '@mantine/core';
import {useMediaQuery} from "@mantine/hooks";
import {IconMessageCircle, IconPhoto, IconSettings} from "@tabler/icons-react";
import {useNavigate, useOutlet} from "react-router-dom";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";

export function OrderFillerDashboard() {
    // const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.md})`);
    const outlet = useOutlet()
    const navigate = useNavigate();

    const { selectedOrder, setSelectedOrder, forceRefresh } = useSelectedOrder();

    // Function to trigger force refresh
    // const handleDataModified = () => {
    //     setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    // };


    const onSelectOrder = (order: Order) => {

        navigate(`/dashboard/filler/order/${order.id}`)
        if (order.id === selectedOrder?.id) {
            setSelectedOrder(null);
        } else {
            setSelectedOrder(order);
        }
    }

    const iconStyle = { width: rem(12), height: rem(12) };
    const orderTable = <OrdersTable
        statusFilter={[OrderStatus.ASSIGNED, OrderStatus.CREATED]}
        view={"default"}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefresh}
        selectedOrder={selectedOrder}
    ></OrdersTable>;

    return (
        <>
            { isMobile && <Tabs defaultValue="gallery">
            <Tabs.List>
                <Tabs.Tab value="gallery" leftSection={<IconPhoto style={iconStyle} />}>
                    Orders List
                </Tabs.Tab>
                <Tabs.Tab value="messages" leftSection={<IconMessageCircle style={iconStyle} />}>
                    Order Detail
                </Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings style={iconStyle} />}>
                    Filling
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="gallery">
                {orderTable}
            </Tabs.Panel>

            <Tabs.Panel value="messages">
                { selectedOrder && outlet}
            </Tabs.Panel>

            <Tabs.Panel value="settings">
                Settings tab content
            </Tabs.Panel>
        </Tabs> }
            {!isMobile &&
        <Grid gutter={25}>
            <GridCol span={{base: 12, md: selectedOrder && outlet ? 6 : 12}}>
                {orderTable}
            </GridCol>
            <GridCol span={6} visibleFrom={'md'}>
                { selectedOrder && outlet}

            </GridCol>
            {/*<GridCol span={6}>*/}
            {/*    { !!selectedOrder && <AssignedOrderSection order={selectedOrder}></AssignedOrderSection> }*/}
            {/*</GridCol>*/}


        </Grid>
            }
    </>
    )
}
export default OrderFillerDashboard;
