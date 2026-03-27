import client from "./client";

export interface ConversationTurn {
    question: string;
    answer: string;
}

export interface AiQueryResponse {
    answer: string;
}

const query = (question: string, history: ConversationTurn[] = []) =>
    client.post<AiQueryResponse>("/admin/ai-query", { question, history });

export default { query };
