import client from "./client";

const ordersCreated = () =>
    client.get<any>("/admin/reports/orders-created?period=WEEKLY&count=8");

const topItemsLastWeek = () =>
    client.get<any>("/admin/reports/top-requested-items-last-week");

export default {
    ordersCreated,
    topItemsLastWeek,
};
