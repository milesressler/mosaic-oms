export interface BaseObject {
    uuid: string;
    created: string;
    updated: string;
    id: number;
}

export interface Order extends BaseObject {
    orderStatus: OrderStatus;
    customer: Customer;
    lastStatusUpdate: string;

}

export interface OrderDetails extends Order {
    items: OrderItem[];
    lastStatusChange: {
        user: string;
        assigneeExt: string
        status: OrderStatus;
        timestamp: string;
    };
    history: {
        user: string;
        status: OrderStatus;
        timestamp: string;
    }[];
}

export interface Customer {
    name: string
}

export interface User {
    name: string
}

export enum OrderStatus {
    CREATED = "CREATED",
    FILLED = "FILLED",
    ASSIGNED = "ASSIGNED",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
}

    interface ItemRequest {
    description: string;
    notes: string;
    quantity: number;
}

export interface OrderRequest {
    customerName: string;
    customerPhone: string;
    specialInstructions: string;
    optInNotifications: boolean;
    items: ItemRequest[];
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export interface Page<T> {
    content?: T[];
    totalPages?: number;
    totalElements?: number;
}
export interface Item {
    id: number;
    placeholder: string;
    description: string;
}

export interface AdminItem extends Item{
    suggestedItem: boolean;
}

export interface UpdateItemRequest {
    suggestedItem?: boolean
    placeholder?: string
}
export interface OrderItem {
    description: string;
    quantityRequested: number;
    quantityFulfilled: number;
    notes: string | null;
    id: number;
}
