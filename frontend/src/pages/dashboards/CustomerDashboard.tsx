import useApi from "../../hooks/useApi.tsx";
import ordersApi from "../../services/ordersApi.tsx";

const CustomerDashboard = () => {
    const getOrdersApi = useApi(ordersApi.getOrders);
    return (
        <>

        </>
    )
}

export default CustomerDashboard;
