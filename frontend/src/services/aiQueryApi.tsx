import client from "./client";

export interface AiQueryResponse {
    answer: string;
}

const query = (question: string) =>
    client.post<AiQueryResponse>("/admin/ai-query", { question });

export default { query };
