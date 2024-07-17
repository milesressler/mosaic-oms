import client from "./client";
import {TransitInfo} from "src/models/types.tsx";

const getTransitInfo = () =>
    client.get<TransitInfo[]>("/transit/bus/arrivals?location=mosaic_north");

export default {
    getTransitInfo,
};
