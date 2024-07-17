import {useNavigate} from "react-router-dom";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {Order} from "src/models/types.tsx";

const AdminOrdersPage = () => {

    const navigate = useNavigate();

    return (
        <>
            <OrdersTable view={"admin"}
                         autoRefresh={false}
                         onSelectRow={(order: Order) => {
                             navigate(`/order/${order.id}`);
                         }} >
            </OrdersTable>
        </>
    );
};

export default AdminOrdersPage;
