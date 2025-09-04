import {OrderStatus} from "src/models/types.tsx";
import {Badge, MantineSize} from "@mantine/core";
import {statusDisplay} from "src/utils/StatusUtils.tsx";

export function StatusBadge({ orderStatus, size, variant }: { orderStatus: OrderStatus, size?: MantineSize, variant?: 'light'|'outline' }) {
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
        <Badge variant={variant ?? 'filled'} color={color} size={size ?? 'md'}>{statusDisplay(orderStatus)}</Badge>
    );
}

export default StatusBadge;
