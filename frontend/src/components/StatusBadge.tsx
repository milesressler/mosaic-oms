import {OrderStatus} from "src/models/types.tsx";
import {Badge} from "@mantine/core";

export function StatusBadge({ orderStatus }: { orderStatus: OrderStatus }) {
    let color: string;
    let text = orderStatus.toUpperCase();

    switch (orderStatus) {
        case OrderStatus.CREATED:
            color = 'blue';
            break;
        case OrderStatus.ACCEPTED:
            color = 'cyan';
            break;
        case OrderStatus.ASSIGNED:
            color = 'cyan';
            break;
        case OrderStatus.FILLED:
            color = 'lightblue';
            break;
        case OrderStatus.NEED_INFO:
            color = 'yellow';
            text = "NEED INFO";
            break;
        case OrderStatus.READY_FOR_PICKUP:
            color = 'green';
            text = "READY FOR PICKUP";
            break;
        case OrderStatus.COMPLETED:
            color = 'purple';
            break;
        case OrderStatus.CANCELLED:
            color = 'red';
            break;
        case OrderStatus.IN_PROGRESS:
            color = 'cyan';
            text = 'IN PROGRESS'
            break;
        default:
            color = 'gray'; // Default color for any unknown statuses
    }

    return (
        <Badge color={color}>{text}</Badge>
    );
}

export default StatusBadge;
