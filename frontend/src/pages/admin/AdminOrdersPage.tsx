import {useNavigate} from "react-router-dom";
import OrdersTable from "src/components/OrdersTable.tsx";
import {Order} from "src/models/types.tsx";

const AdminOrdersPage = () => {

    const navigate = useNavigate();

    return (
        <>
            <OrdersTable view={"AdminOrdersPage"}
                         autoRefresh={false}
                         onSelectRow={(order: Order) => {
                             navigate(`/order/${order.id}`);
                         }} >
            </OrdersTable>
        </>
    );
};

export default AdminOrdersPage;
