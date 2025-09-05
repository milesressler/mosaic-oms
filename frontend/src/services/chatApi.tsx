import client from "./client";
import { ChatMessageResponse, ChatMessageRequest, ChatParticipant } from "src/models/chat";
import { Page } from "src/models/types";
import { AxiosResponse } from "axios";

const sendMessage = (data: ChatMessageRequest): Promise<AxiosResponse<ChatMessageResponse>> => 
    client.post<ChatMessageResponse>("/chat/message", data);

const getGlobalMessages = (params?: { page?: number; size?: number }): Promise<AxiosResponse<Page<ChatMessageResponse>>> => 
    client.get<Page<ChatMessageResponse>>("/chat/global", { params });

const getDirectMessages = (userId: string, params?: { page?: number; size?: number }): Promise<AxiosResponse<Page<ChatMessageResponse>>> => 
    client.get<Page<ChatMessageResponse>>(`/chat/direct/${userId}`, { params });

const getDirectMessageParticipants = (): Promise<AxiosResponse<ChatParticipant[]>> => 
    client.get<ChatParticipant[]>("/chat/participants");

const searchMessages = (params: { q: string; page?: number; size?: number }): Promise<AxiosResponse<Page<ChatMessageResponse>>> => 
    client.get<Page<ChatMessageResponse>>("/chat/search", { params });

export default {
    sendMessage,
    getGlobalMessages,
    getDirectMessages,
    getDirectMessageParticipants,
    searchMessages,
};
