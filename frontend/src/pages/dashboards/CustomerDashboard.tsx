
import {Order} from "src/models/types.tsx";
import OrdersTable from "src/components/OrdersTable.tsx";

const CustomerDashboard = ({onSelectRow}: {onSelectRow: (order: Order) => void}) => {
    return (<OrdersTable view={"CustomerDashboard"}
                         onSelectRow={onSelectRow}
                         showProgressIndicator={true}
    ></OrdersTable>);
}

export default CustomerDashboard;
