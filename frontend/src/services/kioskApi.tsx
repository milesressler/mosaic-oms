import client from "./client";
import {Order, TransitInfo} from "src/models/types.tsx";

const getTransitInfo = () =>
    client.get<TransitInfo[]>("/transit/bus/arrivals?location=mosaic_north", { withCredentials: true});

const getOrdersDashboardViewKiosk = (params?: {}) => client.get<Order[]>("/order/public/dashboard", {params,  withCredentials: true });


export default {
    getTransitInfo,
    getOrdersDashboardViewKiosk,
};
