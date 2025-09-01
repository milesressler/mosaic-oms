import {Grid, Modal} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/context/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {useState} from "react";
import {useFeatures} from "src/context/FeaturesContext.tsx";
import OrdersClosedAlert from "src/components/common/orders/OrdersClosedAlert.tsx";

export function OrderFillerDashboard() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);
    const { selectedOrder } = useSelectedOrder();


    const triggerTableRefresh = () => {
        setForceRefreshTable(prev => !prev);
    }

    const onSelectOrder = (order: Order) => {
        if (id && order.id === +id) {
            navigate(`/dashboard/filler/`)
        } else {
            navigate(`/dashboard/filler/order/${order.id}`)
        }
    }

    const customerName = `${selectedOrder?.customer?.firstName || ''} ${selectedOrder?.customer?.lastName || ''}`.trim()

    const { ordersOpen, featuresLoading} = useFeatures();

    return (
        <SelectedOrderProvider>
            <Modal size={'md'}
                   opened={!!selectedOrder}
                   title={`${customerName} - ${selectedOrder?.id}`}
                   onClose={() => {
                navigate(`/dashboard/filler/`)}}>
                <OrderDetailSection  onUpdate={triggerTableRefresh}/>
            </Modal>
            <>
            {
                !featuresLoading && !ordersOpen && <OrdersClosedAlert/>
            }
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
