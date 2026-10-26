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
    assignee: BasicUser;
    assigneeExtId: string;
    assigneeName: string;
    userName: string;
    userExtId: string;
    order: Order;
}

export interface BulkOrderNotification {
    userName: string;
    userExtId: string;
    orders: Order[];
}

export interface FeaturesNotification {
    featuresValues: object;
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
        previousStatus?: OrderStatus;
        timestamp: string;
    };
    specialInstructions: string;
    history: {
        user: BasicUser;
        status: OrderStatus;
        eventType: HistoryEventType;
        exportType: ExportType;
        timestamp: string;
        comment?: string; // Comment for status changes like NEEDS_INFO
    }[];
}

export interface Customer {
    firstName: string
    lastName: string
    displayName: string
    uuid: string
    created: number
    showerWaiverCompleted: number | null
    waiverIsValid: boolean
    flagged: boolean
    obfuscatedName: boolean
    excludeFromMetrics: boolean
}

export interface CustomerSearchResult {
    firstName: string
    lastName: string
    id: number
    uuid: string
    flagged: boolean
    validWaiver: boolean | null
    showerWaiverCompleted: string
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
    sources: string[],
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
    customerFirstName?: string;
    customerLastName?: string;
    customerNameObfuscated?: boolean;
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
    type: 'SINGLE_SELECT'|'MULTI_SELECT'|'NUMERIC_RANGE'|'TEXT'
    options: {label: string, value: string, available: boolean}[]
    groupName?: string
    groupOrder?: number
    sortOrder?: number
}

export type LimitPeriodUnit = 'WEEK' | 'MONTH' | 'YEAR';
export type LimitWindow = 'ROLLING' | 'CALENDAR';

export interface ItemLimitRule {
    quantity: number;
    periodValue: number;
    periodUnit: LimitPeriodUnit;
    window: LimitWindow;
    periodStartMonth?: number | null;
}

export interface ItemLimitStatus {
    rule: ItemLimitRule;
    evaluatedAt: string;
    periodStart: string;
    receivedInPeriod: number;
    remaining: number;
    lastReceivedAt: string | null;
    nextEligibleAt: string | null;
    // Only set on order item snapshots
    requestedQuantity?: number | null;
    overLimit?: boolean | null;
}

export interface CustomerItemLimit {
    itemId: number;
    description: string;
    category: Category;
    status: ItemLimitStatus;
}

export interface ItemLimitEntry {
    id: number;
    itemId: number;
    itemDescription: string;
    receivedOn: string; // yyyy-MM-dd, local date
    quantity: number;
    notes: string | null;
    createdBy: BasicUser | null;
    created: string;
}

export interface CreateItemLimitEntryRequest {
    itemId: number;
    receivedOn: string; // yyyy-MM-dd
    quantity: number;
    notes?: string;
    // The order being filled, to re-check its limits with this entry
    orderUuid?: string;
}

export interface CreateItemLimitEntryResponse {
    entry: ItemLimitEntry;
    // Re-checked snapshots keyed by order item id
    orderItemSnapshots: Record<number, ItemLimitStatus>;
}

export interface CustomerItemHistoryRow {
    source: 'ORDER' | 'RECORDED';
    // Order completion time, or the start of the recorded day
    receivedAt: string;
    item: Item;
    quantityRequested: number;
    quantityFulfilled: number | null;
    attributes: { [key: string]: string };
    notes: string | null;
    orderId: number | null;
    orderUuid: string | null;
    entry: ItemLimitEntry | null;
}

export type HistoryFillFilter = 'ALL' | 'RECEIVED' | 'UNFILLED';

export interface CustomerItemHistoryParams {
    limitedOnly?: boolean;
    fill?: HistoryFillFilter;
    category?: string | null;
    q?: string;
    from?: string | null;
    to?: string | null;
}

export interface ItemLimitRequest {
    enabled: boolean;
    quantity?: number;
    periodValue?: number;
    periodUnit?: LimitPeriodUnit;
    window?: LimitWindow;
    periodStartMonth?: number | null;
}

export interface Item {
    id: number;
    placeholder: string;
    description: string;
    category: Category;
    availability: string;
    attributes: ItemAttribute[];
    limit?: ItemLimitRule | null;
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
    availability?: string
    attributes?: any[];
    limit?: ItemLimitRequest;
}
export interface CreateItemRequest {
    suggestedItem?: boolean
    placeholder?: string
    description: string
    category?: string
    limit?: ItemLimitRequest
}
export interface OrderItem {
    description: string;
    category?: Category;
    quantityRequested: number;
    quantityFulfilled: number;
    attributes: { [key: string]: string };
    notes: string | null;
    id: number;
    item: Item;
    limitSnapshot?: ItemLimitStatus | null;
}

export interface AdminUser {

}

export interface OrderFeedItem {
    timestamp: number;
    orderId: number;
    orderStatus: OrderStatus;
    user: BasicUser
}

export interface AuditLog {
    timestamp: string
}

export interface FeatureConfig {
    groupMeEnabled: boolean
    ordersOpen: boolean
    printOnTransitionToStatus: OrderStatus
}

export interface Device extends BaseObject{
    userAgent?: string,
    name: string,
    autoRenew?: boolean,
    expiration?: string,
    lastAccessed?: string,
}
// ReservationStatus now matches backend Java enum
export enum ReservationStatus {
    QUEUED = "QUEUED",
    IN_USE = "IN_USE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    READY = "READY",
}

// Core reservation response used for individual reservations
export interface ShowerReservationResponse {
    uuid: string;
    customer: Customer;              // assume existing Customer interface with displayName
    status: ReservationStatus;
    queuePosition: number;
    startedAt?: string | null;
    endTime?: string | null;        // actual end timestamp or projected availability
    showerNumber?: number | null;
    notes?: string | null;
}

/**
 * Represents the status of a single shower stall
 */
export interface StallStatus {
    stallNumber: number;
    status: ReservationStatus;
    reservation: ShowerReservationResponse | null;
    availableAt: string;            // ISO timestamp when stall next frees up
}

/**
 * Represents a single entry in the waiting queue, with estimates
 */
export interface QueueEntryResponse {
    uuid: string;
    customer: Customer;
    queuePosition: number;
    estimatedStart: string;         // ISO timestamp when they can start
    readyNow: boolean;
}

/**
 * Combined response for the shower queue endpoint
 */
export interface ShowerQueueResponse {
    stalls: StallStatus[];
    queue: QueueEntryResponse[];
    nextEstimatedStart: string;  // ISO timestamp for when the next person added would start
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

// Notification types
export enum NotificationType {
    NEEDS_MORE_INFO = "NEEDS_MORE_INFO",
    ORDER_ASSIGNED = "ORDER_ASSIGNED",
    ORDER_COMPLETED = "ORDER_COMPLETED",
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"
}

export interface NotificationResponse {
    id: number;
    uuid: string;
    type: NotificationType;
    relatedOrder?: Order;
    created: string;
    seen: boolean;
    message?: string; // Comment from related order history
}

export interface NotificationSummaryResponse {
    totalUnseen: number | null;
    lastSeenId: number | null;
    notifications: NotificationResponse[];
    nextCursor: number | null;
    hasMore: boolean;
}

export interface UpdateOrderStatusRequest {
    comment?: string;
}
