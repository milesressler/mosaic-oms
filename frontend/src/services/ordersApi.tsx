import client from "./client";
import {Order, OrderDetails, OrderRequest, OrderStatus, Page} from "src/models/types.tsx"

const createOrder = (data: OrderRequest) => client.post("/order", data);
const getOrders = (params?: {}) => client.get<Page<Order>>("/order", {params});
const getOrderById = (id: number) => client.get<OrderDetails>(`/order/${id}`);
const getOrderByUuid = (uuid: string) => client.get(`/order/${uuid}`);
const updateOrderStatus = (uuid: string, state: OrderStatus) => client.put(`/order/${uuid}/state/${state}`);
const updateOrderDetails = (uuid: string) => client.put(`/order/${uuid}`);
const updateOrderItem = (id: number) => client.put(`/orderitem/${id}`);

export default {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderDetails,
    updateOrderItem
};
