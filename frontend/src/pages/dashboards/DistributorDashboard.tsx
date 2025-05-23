import {Grid, GridCol, Modal} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {useState} from "react";

export function DistributorDashboard() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedOrder } = useSelectedOrder();

    const triggerTableRefresh = () => {
        setForceRefreshTable(prev => !prev);
    }

    const handleUpdateCompleted = () => {
        triggerTableRefresh();
        navigate(`/dashboard/distributor/`);
    }

    const onSelectOrder = (order: Order) => {
        if (id && order.id === +id) {
            navigate(`/dashboard/distributor/`)
        } else {
            navigate(`/dashboard/distributor/order/${order.id}`)
        }
    }
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);

    const orderTable = <OrdersTable
        statusFilter={[OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.IN_TRANSIT]}
        view={OrdersView.DISTRIBUTOR}
        onSelectRow={onSelectOrder}
        showProgressIndicator={true}
        forceRefresh={forceRefreshTable}
        selectedOrderIds={id ? [+id] : null}
        maxNumberOfRecords={10}
    ></OrdersTable>;

    return (
        <SelectedOrderProvider>

            <Modal size={'md'} opened={!!selectedOrder} title={`Order Detail`} onClose={() => {
                navigate(`/dashboard/distributor/`)}}>
                <OrderDetailSection onUpdate={handleUpdateCompleted}/>            </Modal>
            <>
            <Grid gutter={25}>
                <GridCol span={{base: 12}}>
                    {orderTable}
                </GridCol>
            </Grid>
        </>
    </SelectedOrderProvider>
    )
}
export default DistributorDashboard;
