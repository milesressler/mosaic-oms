import client from "./client";
import {FeatureConfig, OrderStatus} from "src/models/types.tsx";

const getFeatureConfig = () =>
    client.get<FeatureConfig>("/feature");
const adminUpdateFeatureConfig = (groupMeEnabled: boolean|null, ordersOpen: boolean|null, printOnTransitionToStatus: OrderStatus|null|"") =>
    client.put<FeatureConfig>("/admin/feature", {groupMeEnabled, ordersOpen, printOnTransitionToStatus});

const ordersUpdateFeatureConfig = (ordersOpen: boolean|null) =>
    client.put<FeatureConfig>("/feature/orders", {ordersOpen});

export default {
    getFeatureConfig,
    ordersUpdateFeatureConfig,
    adminUpdateFeatureConfig,
};
