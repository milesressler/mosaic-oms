import client from "./client";
import { NotificationSummaryResponse } from "src/models/types.tsx";

const getNotifications = (cursor?: number, pageSize?: number) => {
    const params: Record<string, any> = {};
    if (cursor !== undefined) params.cursor = cursor;
    if (pageSize !== undefined) params.pageSize = pageSize;
    
    return client.get<NotificationSummaryResponse>("/notifications", { params });
};

const markNotificationsAsSeen = () => client.put("/notifications/mark-seen");

export default {
    getNotifications,
    markNotificationsAsSeen,
};