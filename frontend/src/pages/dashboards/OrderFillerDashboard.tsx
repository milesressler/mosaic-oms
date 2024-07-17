import {Grid, GridCol, rem, Tabs} from "@mantine/core";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {useState} from "react";
import {Order, OrderStatus} from "src/models/types.tsx";
import AssignedOrderSection from "src/components/fillers/AssignedOrderSection.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import { DEFAULT_THEME } from '@mantine/core';
import {useMediaQuery} from "@mantine/hooks";
import {IconMessageCircle, IconPhoto, IconSettings} from "@tabler/icons-react";

export function OrderFillerDashboard() {
    const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
    const [forceRefresh, setForceRefresh] = useState(false);
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.md})`);


    // Function to trigger force refresh
    const handleDataModified = () => {
        setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    };

    const onSelectOrder = (order: Order) => {
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

    const orderDetail = <OrderDetailSection order={selectedOrder} onModified={handleDataModified}></OrderDetailSection>;

    return (
        <>{ isMobile && <Tabs defaultValue="gallery">
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
                {orderDetail}
            </Tabs.Panel>

            <Tabs.Panel value="settings">
                Settings tab content
            </Tabs.Panel>
        </Tabs> }
            {!isMobile &&
        <Grid gutter={25}>
            <GridCol span={{base: 12, md: selectedOrder ? 6 : 12}}>
                {orderTable}
            </GridCol>
            <GridCol span={6} visibleFrom={'md'}>
                { selectedOrder && orderDetail  }
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
