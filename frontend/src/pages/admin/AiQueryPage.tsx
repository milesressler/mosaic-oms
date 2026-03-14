import {
    Box,
    Button,
    Code,
    Group,
    ScrollArea,
    Stack,
    Table,
    Text,
    Textarea,
} from "@mantine/core";
import { useState } from "react";
import useApi from "src/hooks/useApi.tsx";
import aiQueryApi, { AiQueryResponse } from "src/services/aiQueryApi.tsx";

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

    const result: AiQueryResponse | null = queryApi.data;

    return (
        <Stack gap="md" m="xs">
            <Text size="xl" fw={700}>AI Data Query</Text>
            <Text size="sm" c="dimmed">
                Ask a question about the data in plain English. For example: "How many orders were completed last week?"
            </Text>

            <Textarea
                placeholder="Ask a question about the data..."
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
                    Run Query
                </Button>
                <Text size="xs" c="dimmed">or Cmd/Ctrl + Enter</Text>
            </Group>

            {queryApi.error && (
                <Box>
                    <Text size="sm" c="red">{queryApi.error}</Text>
                </Box>
            )}

            {result && (
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        {result.rowCount} {result.rowCount === 1 ? "row" : "rows"} returned
                    </Text>

                    {result.rowCount === 0 ? (
                        <Text c="dimmed" ta="center">No results found.</Text>
                    ) : (
                        <ScrollArea>
                            <Table striped highlightOnHover withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        {result.columns.map((col) => (
                                            <Table.Th key={col}>
                                                <Code>{col}</Code>
                                            </Table.Th>
                                        ))}
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {result.rows.map((row, rowIdx) => (
                                        <Table.Tr key={rowIdx}>
                                            {row.map((cell, cellIdx) => (
                                                <Table.Td key={cellIdx}>
                                                    <Text size="sm" ff="monospace">
                                                        {cell === null ? (
                                                            <Text span c="dimmed" fs="italic">null</Text>
                                                        ) : String(cell)}
                                                    </Text>
                                                </Table.Td>
                                            ))}
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    )}
                </Stack>
            )}
        </Stack>
    );
}
