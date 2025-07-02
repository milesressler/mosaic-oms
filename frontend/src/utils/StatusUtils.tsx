import {OrderStatus} from "src/models/types.tsx";

export function statusDisplay(status: OrderStatus) {
    switch (status) {
        case OrderStatus.ACCEPTED:
            return "Accepted";
        case OrderStatus.PENDING_ACCEPTANCE:
            return "Pending";
        case OrderStatus.COMPLETED:
            return "Completed";
        case OrderStatus.CANCELLED:
            return "Cancelled";
        case OrderStatus.READY_FOR_CUSTOMER_PICKUP:
            return "Ready for Pickup";
        case OrderStatus.NEEDS_INFO:
            return "See Order Taker";
        case OrderStatus.IN_PROGRESS:
            return "In-Progress";
        case OrderStatus.IN_TRANSIT:
            return "In-Transit";
        case OrderStatus.PACKED:
            return "Packed";
        case OrderStatus.PACKING:
            return "Packing";
        default:
            return "Unknown";
    }
}
