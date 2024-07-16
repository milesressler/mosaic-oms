import {Grid, GridCol} from "@mantine/core";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import OrdersListSection from "src/components/fillers/OrdersListSection.tsx";
import {useState} from "react";
import {Order, OrderStatus} from "src/models/types.tsx";
import AssignedOrderSection from "src/components/fillers/AssignedOrderSection.tsx";
import OrdersTable from "src/components/OrdersTable.tsx";

export function OrderFillerDashboard() {
    const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
    const [forceRefresh, setForceRefresh] = useState(false);

    // Function to trigger force refresh
    const handleDataModified = () => {
        setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    };

    return (
        <Grid gutter={25}>
            <GridCol span={6}>
                <OrdersTable statusFilter={[OrderStatus.ASSIGNED, OrderStatus.CREATED]}
                             view={"OrdersListSection"}
                             onSelectRow={setSelectedOrder}
                             showProgressIndicator={true}
                             forceRefresh={forceRefresh}
                ></OrdersTable>
            </GridCol>
            <GridCol span={6}>
                { !!selectedOrder && <OrderDetailSection order={selectedOrder} onModified={handleDataModified}></OrderDetailSection> }
            </GridCol>
            {/*<GridCol span={6}>*/}
            {/*    { !!selectedOrder && <AssignedOrderSection order={selectedOrder}></AssignedOrderSection> }*/}
            {/*</GridCol>*/}


        </Grid>
    )
}
export default OrderFillerDashboard;
