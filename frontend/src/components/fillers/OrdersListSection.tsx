import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/OrdersTable.tsx";

interface OrdersListSectionProps {
    onOrderSelected: (order: Order) => void,
    handl: () => void,
}

export function OrdersListSection({onOrderSelected}: OrdersListSectionProps) {

    return (
    );
}

export default OrdersListSection;
