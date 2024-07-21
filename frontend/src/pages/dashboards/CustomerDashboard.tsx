
import {Order} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {Grid, GridCol} from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";

const CustomerDashboard = ({onSelectRow}: {onSelectRow: (order: Order) => void}) => {
    return (<Grid>
        <GridCol span={8}>
            <OrdersTable view={"public"}
                         onSelectRow={onSelectRow}
                         showProgressIndicator={true}
            />
        </GridCol>
        <GridCol span={4}>
            <Transit/>
        </GridCol>

        </Grid>);
}

export default CustomerDashboard;
