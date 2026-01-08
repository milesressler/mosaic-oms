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

const getSystemMetrics = (params?: SystemMetricsParams) => 
    client.get<SystemMetricsResponse>("/reports/system-metrics", { params });

const getWeeklyCustomersServed = (params?: SystemMetricsParams) =>
    client.get<WeeklyCustomerCount[]>("/reports/weekly-customers-served", { params });

export default {
    getSystemMetrics,
    getWeeklyCustomersServed
};
