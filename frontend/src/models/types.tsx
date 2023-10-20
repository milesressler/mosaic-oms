interface BaseObject {
    uuid: string;
    created: string;
    updated: string;
    id: number;
}

interface Order extends BaseObject {
    orderStatus: OrderStatus;

}

interface OrderDetails extends Order {
    orderStatus: OrderStatus;
}

interface User {
    name: string
}

enum OrderStatus {
    FULFILLED = "FULFILLED"
}

    interface ItemRequest {
    description: string;
    notes: string;
    quantity: number;
}

interface OrderRequest {
    customerName: string;
    customerPhone: string;
    specialInstructions: string;
    optInNotifications: boolean;
    items: ItemRequest[];
}
