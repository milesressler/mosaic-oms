import client from "./client";
import {FeatureConfig, OrderStatus} from "src/models/types.tsx";

const getFeatureConfig = () =>
    client.get<FeatureConfig>("/admin/feature");
const updateFeatureConfig = (groupMeEnabled: boolean|null, printOnTransitionToStatus: OrderStatus|null|"") =>
    client.put<FeatureConfig>("/admin/feature", {groupMeEnabled, printOnTransitionToStatus});

export default {
    getFeatureConfig,
    updateFeatureConfig,
};
