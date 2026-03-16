import {
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
} from "@mantine/core";
import { useState } from "react";
import useApi from "src/hooks/useApi.tsx";
import aiQueryApi from "src/services/aiQueryApi.tsx";

export default function AiQueryPage() {
    const [question, setQuestion] = useState<string>("");
    const queryApi = useApi(aiQueryApi.query);

    const handleSubmit = async () => {
        if (!question.trim()) return;
        await queryApi.request(question.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <Stack gap="md" m="xs">
            <Text size="xl" fw={700}>AI Data Query</Text>
            <Text size="sm" c="dimmed">
                Ask a question about the data in plain English. The AI will explore the database to find the answer.
            </Text>

            <Textarea
                placeholder='e.g. "How many orders were completed last week?" or "What are the most requested items this month?"'
                value={question}
                onChange={(e) => setQuestion(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                minRows={3}
                autosize
                disabled={queryApi.loading}
            />

            <Group>
                <Button
                    onClick={handleSubmit}
                    loading={queryApi.loading}
                    disabled={!question.trim()}
                >
                    Ask
                </Button>
                <Text size="xs" c="dimmed">or Cmd/Ctrl + Enter</Text>
            </Group>

            {queryApi.error && (
                <Text size="sm" c="red">{queryApi.error}</Text>
            )}

            {queryApi.data && (
                <Paper withBorder p="md" radius="md">
                    <Text style={{ whiteSpace: "pre-wrap" }}>{queryApi.data.answer}</Text>
                </Paper>
            )}

            {queryApi.loading && (
                <Box>
                    <Text size="sm" c="dimmed">Analyzing data...</Text>
                </Box>
            )}
        </Stack>
    );
}
