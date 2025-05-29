import {useEffect} from "react";
import useApi from "src/hooks/useApi.tsx";
import {Box, Divider, Loader, ScrollArea, Stack, Text, Title} from "@mantine/core";
import announcementsApi from "src/services/announcementsApi.tsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
export function ChangelogModalContent() {
  const structuredChangeLogFetch = useApi(announcementsApi.getStructuredChangelog);

    useEffect(() => {
        structuredChangeLogFetch.request();
    }, []);

    if (structuredChangeLogFetch.loading) {
        return <Loader />;
    }

    if (structuredChangeLogFetch.error) {
        return <Text c="red">Failed to load changelog</Text>;
    }


    return (
        <ScrollArea h={500}>
            <Stack p="md" gap="lg">
                {structuredChangeLogFetch.data?.map((entry: any) => (
                    <><Box key={entry.date}>
                        <Title order={3}>{entry.date}</Title>
                        <Box mt="sm"
                             style={{ color: '#5a5a5a'}}>
                            <ReactMarkdown
                                children={entry.body}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: (props) => <Text fw={700} size="xl" mt="xl" mb="sm" {...props} />,
                                    h2: (props) => <Text fw={600} size="lg" mt="lg" mb="xs" {...props} />,
                                    h3: (props) => <Text fw={600} size="md" mt="md" mb="xs" {...props} />,
                                    p: (props) => <Text mb="sm" {...props} />,
                                    li: (props) => <li><Text component="span" {...props} /></li>,
                                    a: (props) => <Text component="a" c="blue" {...props} />,
                                }}
                            />
                        </Box>
                    </Box>
                        <Divider/>
                    </>
                ))}
            <Box p="md">

            </Box>
            </Stack>
        </ScrollArea>
    );
}

export default ChangelogModalContent;
