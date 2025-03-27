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
    postedToGroupMe: string;
}

export interface OrderNotification {
    orderUuid: string;
    orderId: number;
    orderStatus: OrderStatus;
    assigneeExtId: string;
    assigneeName: string;
    userName: string;
    userExtId: string;
    order: Order;
}

export interface FeaturesNotification {
    featuresValues: {};
}

export enum HistoryEventType {
    EXPORT = "EXPORT",
    STATUS_CHANGE = "STATUS_CHANGE",
}

export enum ExportType {
    GROUPME = "GROUPME",
    PRINTED = "PRINTED",
}

export interface OrderDetails extends Order {
    items: OrderItem[];
    assignee: BasicUser;
    lastStatusChange: {
        user: string;
        assigneeExt: string
        status: OrderStatus;
        timestamp: string;
    };
    specialInstructions: string;
    history: {
        user: BasicUser;
        status: OrderStatus;
        eventType: HistoryEventType;
        exportType: ExportType;
        timestamp: string;
    }[];
}

export interface Customer {
    name: string
    uuid: string
    created: number
    showerWaiverCompleted: number
}

export interface CustomerSearch {
    firstName: string
    lastName: string
    name: string
    id: number
    uuid: string
}

export interface BasicUser {
    name: string,
    uuid: string,
    externalId: string
    avatar: string
}

export interface User extends BasicUser{
    nickname: string,
    picture: string,
    userId: string,
    email: string,
    emailVerified: boolean,
    created: number,
    lastLogin: number,
}

export interface OrderAction {
    timestamp: number,
    action: string,
    orderId: number
}
export interface UserDetail extends User {
    roles: string[]
    userActions: OrderAction[];
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
    PENDING_ACCEPTANCE = "PENDING_ACCEPTANCE",
    NEEDS_INFO = "NEEDS_INFO",
    ACCEPTED = "ACCEPTED",
    PACKING = "PACKING",
    PACKED = "PACKED",
    IN_TRANSIT = "IN_TRANSIT",
    READY_FOR_CUSTOMER_PICKUP = "READY_FOR_CUSTOMER_PICKUP",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    IN_PROGRESS = "IN_PROGRESS",
}

export interface ItemRequest {
    item: number;
    notes?: string;
    quantity: number;
    attributes?: Record<string, string|number>
}

export interface OrderRequest {
    customerName?: string;
    customerUuid?: string;
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

export interface ItemAttribute {
    key: string
    label: string
    required: boolean
    type: 'SINGLE_SELECT'|'MULTI_SELECT'
    options: {label: string, value: string, available: boolean}[]
}

export interface Item {
    id: number;
    placeholder: string;
    description: string;
    category: Category;
    availability: string;
    attributes: ItemAttribute[];
}

export interface AdminItem extends Item{
    managed: boolean;
    totalOrdered: number;
    totalFilled: number;
}

export interface UpdateItemRequest {
    managed?: boolean
    placeholder?: string
    category?: string
    attributes?: any[];
}
export interface CreateItemRequest {
    suggestedItem?: boolean
    placeholder?: string
    description: string
    category?: string
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

export interface FeatureConfig {
    groupMeEnabled: boolean
    printOnTransitionToStatus: OrderStatus
}

export enum Category{
    CLOTHING = "CLOTHING",
    GEAR = "GEAR",
    HYGIENE = "HYGIENE",
    LINENS = "LINENS",
    FIRST_AID = "FIRST_AID",
    ACCESSORIES = "ACCESSORIES",
    OTHER = "OTHER",
}

export const categoryDisplayNames: Record<Category, string> = {
    [Category.FIRST_AID]: "First Aid",
    [Category.CLOTHING]: "Clothing",
    [Category.HYGIENE]: "Hygiene",
    [Category.GEAR]: "Gear",
    [Category.LINENS]: "Linens",
    [Category.ACCESSORIES]: "Accessories",
    [Category.OTHER]: "Misc",
};
