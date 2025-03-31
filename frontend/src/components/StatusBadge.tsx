import {OrderStatus} from "src/models/types.tsx";
import {Badge} from "@mantine/core";
import {statusDisplay} from "src/util/StatusUtils.tsx";

export function StatusBadge({ orderStatus }: { orderStatus: OrderStatus }) {
    let color: string;

    switch (orderStatus) {
        case OrderStatus.PENDING_ACCEPTANCE:
            color = 'blue';
            break;
        case OrderStatus.IN_PROGRESS:
            color = 'cyan';
            break;
        case OrderStatus.ACCEPTED:
            color = 'cyan';
            break;
        case OrderStatus.NEEDS_INFO:
            color = 'yellow';
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
        <Badge color={color}>{statusDisplay(orderStatus)}</Badge>
    );
}

export default StatusBadge;
