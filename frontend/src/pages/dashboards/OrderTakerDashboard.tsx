import {Grid, GridCol} from "@mantine/core";
import OrderForm from "src/pages/orders/OrderFormPage.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {OrderStatus} from "src/models/types.tsx";

export function OrderTakerDashboard() {
    return (

        <Grid>
            <GridCol span={{base: 12, md: 6}}>
                <OrderForm></OrderForm>
            </GridCol>
            <GridCol span={6} className="mantine-visible-from-sm" >
        <OrdersTable
            view={OrdersView.ORDERTAKER}
            disableSorting={true}
            statusFilter={[OrderStatus.NEEDS_INFO]}
            autoRefresh={true}
            showProgressIndicator={true}

        ></OrdersTable>
            </GridCol>
    </Grid>
)
}
export default OrderTakerDashboard;
