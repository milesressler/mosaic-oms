import {
    ActionIcon,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useApi from "src/hooks/useApi.tsx";
import aiQueryApi, { ConversationTurn } from "src/services/aiQueryApi.tsx";

export default function AiQueryPage() {
    const [question, setQuestion] = useState<string>("");
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const queryApi = useApi(aiQueryApi.query);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation, queryApi.loading]);

    const handleSubmit = async () => {
        const trimmed = question.trim();
        if (!trimmed || queryApi.loading) return;
        setQuestion("");
        const result = await queryApi.request(trimmed, conversation);
        if (result?.data) {
            setConversation(prev => [...prev, { question: trimmed, answer: result.data.answer }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <Stack gap="md" m="xs" style={{ maxWidth: 800 }}>
            <Group justify="space-between">
                <Box>
                    <Text size="xl" fw={700}>AI Data Query</Text>
                    <Text size="sm" c="dimmed">Ask questions about the data in plain English.</Text>
                </Box>
                {conversation.length > 0 && (
                    <Tooltip label="Clear conversation">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => setConversation([])}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>

            {conversation.map((turn, i) => (
                <Stack key={i} gap="xs">
                    <Paper withBorder p="sm" radius="md" bg="blue.0">
                        <Text size="sm" fw={500}>{turn.question}</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {turn.answer}
                        </ReactMarkdown>
                    </Paper>
                </Stack>
            ))}

            {queryApi.loading && (
                <Stack gap="xs">
                    <Paper withBorder p="sm" radius="md" bg="blue.0">
                        <Text size="sm" fw={500}>{question || "…"}</Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md">
                        <Text size="sm" c="dimmed">Analyzing data…</Text>
                    </Paper>
                </Stack>
            )}

            {queryApi.error && (
                <Text size="sm" c="red">{queryApi.error}</Text>
            )}

            <div ref={bottomRef} />

            <Textarea
                placeholder={conversation.length === 0
                    ? 'e.g. "How many orders were completed last week?" or "What are the most requested items this month?"'
                    : "Ask a follow-up question…"
                }
                value={question}
                onChange={(e) => setQuestion(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                minRows={2}
                autosize
                disabled={queryApi.loading}
            />

            <Group>
                <Button
                    onClick={handleSubmit}
                    loading={queryApi.loading}
                    disabled={!question.trim()}
                >
                    {conversation.length === 0 ? "Ask" : "Follow up"}
                </Button>
                <Text size="xs" c="dimmed">Cmd/Ctrl + Enter</Text>
            </Group>
        </Stack>
    );
}
