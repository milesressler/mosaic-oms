interface BaseObject {
    uuid: string;
    created: Date;
    updated: Date;
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
