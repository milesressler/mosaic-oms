import client from "./client";

const createOrder = () => client.post("/order");
const getOrders = () => client.get("/order");
const getOrderById = (uuid) => client.get(`/order/${uuid}`);
const updateOrderStatus = (uuid, state: OrderStatus) => client.put(`/order/${uuid}/state/${state}`);
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
