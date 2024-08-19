import {Grid, GridCol, rem, Tabs} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import { DEFAULT_THEME } from '@mantine/core';
import {useMediaQuery} from "@mantine/hooks";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";

export function RunnerDashboard() {
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const navigate = useNavigate();
    const { id } = useParams();
    const { forceRefresh, selectedOrder } = useSelectedOrder();


    const onSelectOrder = (order: Order) => {
        if (id && order.id === +id) {
            navigate(`/dashboard/runner/`)
        } else {
            navigate(`/dashboard/runner/order/${order.id}`)
        }
    }

    const iconStyle = { width: rem(12), height: rem(12) };
    const orderTable = <OrdersTable
        statusFilter={[OrderStatus.PACKED, OrderStatus.IN_TRANSIT]}
        view={"runner"}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefresh}
        selectedOrderId={id ? +id : null}
        maxNumberOfRecords={10}
    ></OrdersTable>;

    const orderDetailSection = <OrderDetailSection/>;

    return (
        <SelectedOrderProvider>
            <>
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
        </>
    </SelectedOrderProvider>
    )
}
export default RunnerDashboard;
