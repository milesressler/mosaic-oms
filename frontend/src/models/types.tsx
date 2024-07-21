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
    specialInstructions: string;
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
    name: string,
    nickname: string,
    picture: string,
    userId: string,
    emailVerified: boolean,
    created: number,
}

export interface OrderAction {
    timestamp: number,
    action: string,
}
export interface UserDetail extends User {
    roles: string[]
    recentActions: OrderAction[];
}

export enum Location {
    MOSAIC_NORTH = "MOSAIC_NORTH",
    MOSAIC_SOUTH = "MOSAIC_SOUTH",
    MOSAIC_FORT_WORTH = "MOSAIC_FORT_WORTH",
}

export interface TransitInfo {
    stopId: string,
    direction?: string,
    routeId: string,
    tripId: string,
    stopInfo: {
        stopId: string,
        stopName: string,
    },
    nextArrivalTime: number,
    previousArrivalTime?: number,
}


export enum OrderStatus {
    CREATED = "CREATED",
    ACCEPTED = "ACCEPTED",
    NEED_INFO = "NEED_INFO",
    IN_PROGRESS = "IN_PROGRESS",
    FILLED = "FILLED",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",

    ASSIGNED = "ASSIGNED",
    COMPLETED = "COMPLETED",


    CANCELLED = "CANCELLED",
}

export interface ItemRequest {
    description: string;
    notes: string;
    quantity: number;
}

export interface OrderRequest {
    customerName: string;
    customerPhone?: string;
    specialInstructions?: string;
    optInNotifications?: boolean;
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
    totalOrdered: number;
    totalFilled: number;
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

export interface AdminUser {

}

export interface OrderFeedItem {
    timestamp: number;
    orderId: number;
    orderStatus: OrderStatus;
    user: {
        name: string;
        uuid: string;
    };
}

export interface AuditLog {
    timestamp: string
}


