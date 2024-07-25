import {Grid, GridCol, rem, Tabs} from "@mantine/core";
import {useEffect, useState} from "react";
import {Order, OrderStatus} from "src/models/types.tsx";
import AssignedOrderSection from "src/components/fillers/AssignedOrderSection.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import { DEFAULT_THEME } from '@mantine/core';
import {useMediaQuery} from "@mantine/hooks";
import {IconMessageCircle, IconPhoto, IconSettings} from "@tabler/icons-react";
import {useNavigate, useOutlet, useParams} from "react-router-dom";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";

export function OrderFillerDashboard() {
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const outlet = useOutlet()
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedOrderId, setSelectedOrderId, forceRefresh } = useSelectedOrder();

    useEffect(() => {
        if (!id) {
            setSelectedOrderId(null);
        } else {
            setSelectedOrderId(+id);
        }
    }, [id]);
    const onSelectOrder = (order: Order) => {
        if (order.id === selectedOrderId) {
            setSelectedOrderId(null);
            navigate(`/dashboard/filler/`)
        } else {
            setSelectedOrderId(order.id);
            navigate(`/dashboard/filler/order/${order.id}`)
        }
    }

    const iconStyle = { width: rem(12), height: rem(12) };
    const orderTable = <OrdersTable
        statusFilter={[OrderStatus.ACCEPTED, OrderStatus.PENDING_ACCEPTANCE, OrderStatus.PACKING]}
        view={"filler"}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefresh}
        selectedOrderId={selectedOrderId}
        maxNumberOfRecords={10}
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
                {  outlet}
            </Tabs.Panel>

            <Tabs.Panel value="settings">
                Settings tab content
            </Tabs.Panel>
        </Tabs> }
            {!isMobile &&
        <Grid gutter={25}>
            <GridCol span={{base: 12, lg:  outlet ? 6 : 12}}>
                {orderTable}
            </GridCol>
            <GridCol span={6} visibleFrom={'lg'}>
                {  outlet}
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
