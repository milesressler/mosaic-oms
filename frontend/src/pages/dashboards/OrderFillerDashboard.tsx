import {DEFAULT_THEME, Grid, Modal} from "@mantine/core";
import {Order, OrderDetails, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useMediaQuery} from "@mantine/hooks";
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

    return (
        <SelectedOrderProvider>
            <Modal opened={!!selectedOrder} title={`Order Detail`} onClose={() => {
                navigate(`/dashboard/filler/`)}}>
                <OrderDetailSection  onUpdate={triggerTableRefresh}/>
            </Modal>
            <>
            <Grid gutter={0}>
                <OrdersTable
                    statusFilter={[OrderStatus.ACCEPTED, OrderStatus.PENDING_ACCEPTANCE, OrderStatus.PACKING]}
                    view={OrdersView.FILLER}
                    onSelectRow={onSelectOrder}
                    showProgressIndicator={true}
                    forceRefresh={forceRefreshTable}
                    selectedOrderIds={id ? [+id] : null}
                    maxNumberOfRecords={10}
                    disableSorting={true}
                ></OrdersTable>
            </Grid>
        </>
    </SelectedOrderProvider>
    )
}
export default OrderFillerDashboard;
