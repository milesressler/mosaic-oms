import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from "@mantine/core";
import { IconInfoCircle, IconTrash } from "@tabler/icons-react";
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
            <Group align="flex-start">
                <Box style={{ flex: 1 }}>
                    <Group gap="xs" align="center">
                        <Text size="xl" fw={700}>AI Data Query</Text>
                        <Badge color="violet" variant="light" size="sm">Beta</Badge>
                    </Group>
                    <Text size="sm" c="dimmed">Ask questions about the data in plain English.</Text>
                </Box>
            </Group>

            <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" p="xs">
                <Text size="xs" c="dimmed">
                    AI-generated answers may not always be accurate. Verify important figures directly in the data.
                    Test customers are excluded from all results.
                </Text>
            </Alert>

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
                {conversation.length > 0 && (
                    <Tooltip label="Clear conversation">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            ml="auto"
                            onClick={() => setConversation([])}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Stack>
    );
}
