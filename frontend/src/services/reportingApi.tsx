import client from "./client";
import {TransitInfo} from "src/models/types.tsx";

const ordersCreated = () =>
    client.get<TransitInfo[]>("/admin/reports/orders-created?period=WEEKLY&count=12");

export default {
    ordersCreated,
};
