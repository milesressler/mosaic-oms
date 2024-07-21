import client from "./client";
import {AuditLog,Page} from "src/models/types.tsx";

const getAuditLog = (page: number, size: number) =>
    client.get<Page<AuditLog>>("/audit", {params: {page, size}});

export default {
    getAuditLog,
};
