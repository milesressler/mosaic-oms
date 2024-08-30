import {Order} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {Grid, GridCol} from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";

const CustomerDashboard = ({onSelectRow}: {onSelectRow: (order: Order) => void}) => {
    return (<Grid>
        <GridCol span={8}>
            <OrdersTable view={OrdersView.PUBLIC}
                         onSelectRow={onSelectRow}
                         showProgressIndicator={true}
                         disableSorting={true}
            />
        </GridCol>
        <GridCol span={4}>
            <Transit/>
        </GridCol>

        </Grid>);
}

export default CustomerDashboard;
