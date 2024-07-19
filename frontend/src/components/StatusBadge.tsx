import {OrderStatus} from "src/models/types.tsx";
import {Badge} from "@mantine/core";

export function StatusBadge({ orderStatus }: { orderStatus: OrderStatus }) {
    let color: string;

    switch (orderStatus) {
        case OrderStatus.CREATED:
            color = 'blue';
            break;
        case OrderStatus.ASSIGNED:
            color = 'cyan';
            break;
        case OrderStatus.FILLED:
            color = 'green';
            break;
        case OrderStatus.IN_TRANSIT:
            color = 'yellow';
            break;
        case OrderStatus.READY_FOR_PICKUP:
            color = 'orange';
            break;
        case OrderStatus.DELIVERED:
            color = 'purple';
            break;
        case OrderStatus.CANCELLED:
            color = 'red';
            break;
        default:
            color = 'gray'; // Default color for any unknown statuses
    }

    return (
        <Badge color={color}>{orderStatus.toUpperCase()}</Badge>
    );
}

export default StatusBadge;
