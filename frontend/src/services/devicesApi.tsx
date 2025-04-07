import client from "./client";
import {Device, Page} from "src/models/types.tsx";

const registerKiosk = (name: string, expireAt: string|null) =>
    client.post<Device>("/device", {name, expireAt}, {withCredentials: true });
const logoutKiosk = () =>
    client.post("/device/logout", {}, {withCredentials: true });
const getDevices = () =>
    client.get<Page<Device>>("/device");
const whoAmI = () =>
    client.get<string>("/device/me", {withCredentials: true });

const deleteDevice = (uuid: string) => client.delete(`/device/${uuid}`);

export default {
    registerKiosk,
    getDevices,
    deleteDevice,
    logoutKiosk,
    whoAmI,
};
