import {Order, TransitInfo} from "src/models/types.tsx";
import client from "src/services/client.tsx";

const getTransitInfo = () =>
    client.get<TransitInfo[]>("/transit/bus/arrivals?location=mosaic_north", { withCredentials: true});

const getOrdersDashboardViewKiosk = (params?: {size: number}) => client.get<Order[]>("/order/public/dashboard", {params,  withCredentials: true });


export default {
    getTransitInfo,
    getOrdersDashboardViewKiosk,
};
