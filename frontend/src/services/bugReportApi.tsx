import client from "./client";
import { AxiosResponse } from "axios";

export interface CreateBugReportRequest {
    title: string;
    description: string;
}

export interface UpdateBugReportRequest {
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface BugReportResponse {
    uuid: string;
    posthogEventId?: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    reporter?: {
        name: string;
        uuid: string;
        externalId: string;
        avatar?: string;
    };
    created: string;
    updated: string;
}

const createBugReport = (data: CreateBugReportRequest): Promise<AxiosResponse<BugReportResponse>> => 
    client.post<BugReportResponse>("/bugs", data);

const getBugReports = (params?: { status?: string }): Promise<AxiosResponse<BugReportResponse[]>> => 
    client.get<BugReportResponse[]>("/bugs", { params });

const getBugReport = (uuid: string): Promise<AxiosResponse<BugReportResponse>> => 
    client.get<BugReportResponse>(`/bugs/${uuid}`);

const updateBugReport = (uuid: string, data: UpdateBugReportRequest): Promise<AxiosResponse<BugReportResponse>> => 
    client.put<BugReportResponse>(`/bugs/${uuid}`, data);

export default {
    createBugReport,
    getBugReports,
    getBugReport,
    updateBugReport,
};