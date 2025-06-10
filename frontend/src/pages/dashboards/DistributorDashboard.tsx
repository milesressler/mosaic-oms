import {Box, Modal} from "@mantine/core";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {useState} from "react";
import QrScannerButton from "src/components/scanner/QrScannerButton.tsx";

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

    return (
        <SelectedOrderProvider>
            <Modal size={'md'} opened={!!selectedOrder} title={`Order Detail`} onClose={() => {
                navigate(`/dashboard/distributor/`)}}>
                <OrderDetailSection onUpdate={handleUpdateCompleted}/>            </Modal>
            <>
            <OrdersTable
                statusFilter={[OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.IN_TRANSIT]}
                view={OrdersView.DISTRIBUTOR}
                onSelectRow={onSelectOrder}
                showProgressIndicator={true}
                forceRefresh={forceRefreshTable}
                selectedOrderIds={id ? [+id] : null}
                maxNumberOfRecords={10}
            />
            <Box pos={'absolute'} bottom={20} right={20}>
                <QrScannerButton label={''} onOrderScanned={(order: {id: number, uuid: string}) => {
                    navigate(`/dashboard/distributor/order/${order.id}`)
                }}/>
            </Box>
        </>
    </SelectedOrderProvider>
    )
}
export default DistributorDashboard;
