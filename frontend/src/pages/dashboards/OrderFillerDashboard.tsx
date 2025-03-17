import {DEFAULT_THEME, Grid, GridCol, rem, Tabs} from "@mantine/core";
import {Order, OrderDetails, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useMediaQuery} from "@mantine/hooks";
import {IconMessageCircle, IconPhoto, IconSettings} from "@tabler/icons-react";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {useState} from "react";
import {useAuth0} from "@auth0/auth0-react";

export function OrderFillerDashboard() {
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const navigate = useNavigate();
    const { id } = useParams();
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);
    const { selectedOrder } = useSelectedOrder();
    const {user} = useAuth0();


    const triggerTableRefresh = () => {
        setForceRefreshTable(prev => !prev);
    }

    const onSelectOrder = (order: Order) => {
        if (id && order.id === +id) {
            navigate(`/dashboard/filler/`)
        } else {
            const assignedToMe = (order as OrderDetails)?.assignee?.externalId === user?.sub;
            if (assignedToMe) {
                navigate(`/dashboard/filler/fill/${order.id}`)
            } else {
                navigate(`/dashboard/filler/order/${order.id}`)
            }
        }
    }

    const iconStyle = { width: rem(12), height: rem(12) };
    const orderTable = <OrdersTable
        statusFilter={[OrderStatus.ACCEPTED, OrderStatus.PENDING_ACCEPTANCE, OrderStatus.PACKING]}
        view={OrdersView.FILLER}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefreshTable}
        selectedOrderIds={id ? [+id] : null}
        maxNumberOfRecords={10}
        disableSorting={true}
    ></OrdersTable>;

    const orderDetailSection = <OrderDetailSection  onUpdate={triggerTableRefresh}/>;

    return (
        <SelectedOrderProvider>
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
                {/*<GridCol span={6}>*/}
                {/*    { !!selectedOrder && <AssignedOrderSection order={selectedOrder}></AssignedOrderSection> }*/}
                {/*</GridCol>*/}


            </Grid>
                }
        </>
    </SelectedOrderProvider>
    )
}
export default OrderFillerDashboard;
