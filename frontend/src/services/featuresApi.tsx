import client from "./client";
import {FeatureConfig} from "src/models/types.tsx";

const getFeatureConfig = () =>
    client.get<FeatureConfig>("/admin/feature");
const updateFeatureConfig = (groupMeEnabled: boolean|null) =>
    client.put<FeatureConfig>("/admin/feature", {groupMeEnabled: groupMeEnabled});

export default {
    getFeatureConfig,
    updateFeatureConfig,
};
