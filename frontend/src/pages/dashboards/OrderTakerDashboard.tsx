import {Grid, GridCol, Group} from "@mantine/core";
import OrderFormPage from "src/pages/orders/OrderFormPage.tsx";
import MyRecentOrders from "src/pages/orders/MyRecentOrders.tsx";

export function OrderTakerDashboard() {
    return (

        <Grid>
            <GridCol span={{base: 12, md: 8}}>
                <OrderFormPage></OrderFormPage>
            </GridCol>
            <GridCol span={4} className="mantine-visible-from-sm" >
        <MyRecentOrders ></MyRecentOrders>
            </GridCol>
    </Grid>
)
}
export default OrderTakerDashboard;
