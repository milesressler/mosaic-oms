import client from "./client";

export interface SystemMetricsResponse {
    overview: SystemOverview;
}

export interface SystemOverview {
    totalOrders: number;
    totalCustomers: number;
    totalItems: number;
    avgItemsPerOrder: number;
    fillRate: number; // as decimal (0.78 = 78%)
    activeVolunteers: number;
}

interface SystemMetricsParams {
    startDate?: string;
    endDate?: string;
    range?: string;
}

export interface WeeklyCustomerCount {
    weekStart: string; // LocalDate as ISO string
    totalCustomers: number;
    newCustomers: number;
}

export interface WeeklyItemFulfillment {
    weekStart: string; // LocalDate as ISO string
    totalItems: number;
    filledItems: number;
    unfilledItems: number;
}

export type OrderCreationPatterns = Record<string, Record<string, number>>; // { "9:00-9:10": { "2024-01-07": 5, ... }, ... }

export interface ItemMover {
    itemName: string;
    itemId: string;
    thisWeekCount: number;
    fourWeekAvg: number;
    absoluteChange: number;
    percentageChange: number;
    direction: 'UP' | 'DOWN' | 'FLAT';
}

 export interface ProcessStage {
    stage: string;
    avgTime: number;
    description: string;
    source: string;
}

export interface ProcessTimingsResponse {
    processStages: ProcessStage[];
    totalEndToEndTime: number;
}

export interface ItemMetricsResponse {
    totalRequested: number;
    totalFulfilled: number;
    fillRate: number; // as decimal (0.82 = 82%)
}

export interface ItemBreakdownData {
    weekStart: string; // LocalDate as ISO string, nullable for aggregated
    primaryValue: string; // "Size 32", "Blue", etc.
    secondaryValue: string | null; // nullable if no secondary grouping
    requestedCount: number;
    fulfilledCount: number;
}

export interface ItemBreakdownResponse {
    itemId: number;
    groupBy: string;
    secondaryGroupBy: string | null;
    data: ItemBreakdownData[];
}


interface ItemMetricsParams extends SystemMetricsParams {
    itemId: number;
}

interface ItemBreakdownParams extends SystemMetricsParams {
    itemId: number;
    groupBy: string;
    secondaryGroupBy?: string;
}

const getSystemMetrics = (params?: SystemMetricsParams) => 
    client.get<SystemMetricsResponse>("/reports/system-metrics", { params });

const getWeeklyCustomersServed = (params?: SystemMetricsParams) =>
    client.get<WeeklyCustomerCount[]>("/reports/weekly-customers-served", { params });

const getWeeklyItemFulfillment = (params?: SystemMetricsParams) =>
    client.get<WeeklyItemFulfillment[]>("/reports/weekly-item-fulfillment", { params });

const getOrderCreationPatterns = (params?: SystemMetricsParams) =>
    client.get<OrderCreationPatterns>("/reports/order-creation-patterns", { params });

const getBiggestMovers = (params?: SystemMetricsParams) =>
    client.get<ItemMover[]>("/reports/biggest-movers", { params });

const getProcessTimings = (params?: SystemMetricsParams) =>
    client.get<ProcessTimingsResponse>("/reports/process-timings", { params });

const getItemMetrics = (params: ItemMetricsParams) =>
    client.get<ItemMetricsResponse>("/reports/item-metrics", { params });

const getItemBreakdown = (params: ItemBreakdownParams) =>
    client.get<ItemBreakdownResponse>("/reports/item-breakdown", { params });

export default {
    getSystemMetrics,
    getWeeklyCustomersServed,
    getWeeklyItemFulfillment,
    getOrderCreationPatterns,
    getBiggestMovers,
    getProcessTimings,
    getItemMetrics,
    getItemBreakdown
};
