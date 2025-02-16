import {OrderStatus} from "src/models/types.tsx";
import {Badge} from "@mantine/core";

export function StatusBadge({ orderStatus }: { orderStatus: OrderStatus }) {
    let color: string;
    let text = orderStatus.toUpperCase();

    switch (orderStatus) {
        case OrderStatus.PENDING_ACCEPTANCE:
            color = 'blue';
            text = "PENDING";
            break;
        case OrderStatus.IN_PROGRESS:
            color = 'cyan';
            text = "IN PROGRESS"
            break;
        case OrderStatus.ACCEPTED:
            color = 'cyan';
            break;
        case OrderStatus.NEEDS_INFO:
            color = 'yellow';
            text = "SEE ORDER TAKER";
            break;
        case OrderStatus.PACKED:
            color = 'lightblue';
            break;
        case OrderStatus.PACKING:
            color = 'lightblue';
            break;
        case OrderStatus.IN_TRANSIT:
            color = 'purple';
            break;
        case OrderStatus.READY_FOR_CUSTOMER_PICKUP:
            color = 'green';
            text = "READY FOR PICKUP";
            break;
        case OrderStatus.COMPLETED:
            color = 'purple';
            break;
        case OrderStatus.CANCELLED:
            color = 'gray';
            break;
        default:
            color = 'gray'; // Default color for any unknown statuses
    }

    return (
        <Badge color={color}>{text}</Badge>
    );
}

export default StatusBadge;
