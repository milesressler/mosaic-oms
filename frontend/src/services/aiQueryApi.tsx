import client from "./client";

export interface AiQueryResponse {
    columns: string[];
    rows: (string | number | boolean | null)[][];
    rowCount: number;
}

const query = (question: string) =>
    client.post<AiQueryResponse>("/admin/ai-query", { question });

export default { query };
