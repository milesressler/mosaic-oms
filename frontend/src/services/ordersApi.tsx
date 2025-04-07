import client from "./client";
import {Order, OrderDetails, OrderFeedItem, OrderRequest, OrderStatus, Page} from "src/models/types.tsx"

const createOrder = (data: OrderRequest) => client.post("/order", data);
const getOrders = (params?: {}) => client.get<Page<Order>>("/order", {params});
const getOrdersDashboardView = (params?: {}) => client.get<Order[]>("/order/view/dashboard", {params});
const getOrdersDashboardViewKiosk = (params?: {}) => client.get<Order[]>("/order/public/dashboard", {params,  withCredentials: true });
// const getOrdersRunnersView = (params?: {}) => client.get<Order[]>("/order/view/runner", {params});
const getOrdersWithDetails = (params?: any) => client.get<Page<OrderDetails>>("/order", {params: {...params, detailed: true}});
const getOrderById = (id: number) => client.get<OrderDetails>(`/order/${id}`);
const getOrderByUuid = (uuid: string) => client.get(`/order/${uuid}`);
const updateOrderStatusBulk = (uuids: string[], state: OrderStatus) => client.put<Order>(`/order/bulk/state/${state}`, {orderUuids: uuids});
const updateOrderStatus = (uuid: string, state: OrderStatus) => client.put<Order>(`/order/${uuid}/state/${state}`);
const changeAssignee = (uuid: string, unassign: boolean) => client.put<Order>(`/order/${uuid}/assign?unassign=${unassign}`);
const updateOrderDetails = (uuid: string) => client.put(`/order/${uuid}`);
const updateOrderItem = (id: number) => client.put(`/orderitem/${id}`);
const updateOrderItems = (data) => client.put(`/orderitem/quantity/bulk`, data);

const getOrderHistory = (orderId: number) => client.get<OrderFeedItem[]>(`/order/history?orderId=${orderId}`);
const getFeed = () => client.get<OrderFeedItem[]>(`/order/history`);

export default {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderStatusBulk,
    updateOrderDetails,
    updateOrderItem,
    updateOrderItems,
    getOrderHistory,
    getFeed,
    changeAssignee,
    getOrdersWithDetails,
    getOrdersDashboardView,
    getOrdersDashboardViewKiosk,
};
