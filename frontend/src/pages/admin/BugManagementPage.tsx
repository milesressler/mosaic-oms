import {
    Badge,
    Box,
    Button,
    Group,
    Select,
    Stack,
    Table,
    Text,
    Textarea,
    Modal,
    ScrollArea
} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import bugReportApi, { BugReportResponse, UpdateBugReportRequest } from "src/services/bugReportApi.tsx";
import {DateTime} from "luxon";

const STATUS_COLORS = {
    OPEN: 'blue',
    IN_PROGRESS: 'yellow',
    RESOLVED: 'green',
    CLOSED: 'gray',
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
];

export default function BugManagementPage() {
    const getBugReportsApi = useApi(bugReportApi.getBugReports);
    const updateBugReportApi = useApi(bugReportApi.updateBugReport);
    const [selectedBug, setSelectedBug] = useState<BugReportResponse | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [detailModal, setDetailModal] = useState(false);

    const refreshList = () => {
        const params = statusFilter ? { status: statusFilter } : undefined;
        getBugReportsApi.request(params);
    };

    useEffect(() => {
        refreshList();
    }, [statusFilter]);

    const handleStatusChange = async (bugUuid: string, newStatus: string) => {
        const updateData: UpdateBugReportRequest = { 
            status: newStatus as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' 
        };
        
        await updateBugReportApi.request(bugUuid, updateData);
        refreshList();
        
        if (selectedBug?.uuid === bugUuid) {
            setSelectedBug({ ...selectedBug, status: updateData.status });
        }
    };

    const handleViewDetails = (bug: BugReportResponse) => {
        setSelectedBug(bug);
        setDetailModal(true);
    };

    const bugs = getBugReportsApi.data || [];

    const rows = bugs.map((bug) => (
        <Table.Tr key={bug.uuid}>
            <Table.Td>
                <Text size="sm" fw={500}>{bug.title}</Text>
                <Text size="xs" c="dimmed" lineClamp={1}>{bug.description}</Text>
            </Table.Td>
            <Table.Td>
                <Badge color={STATUS_COLORS[bug.status]} size="sm">
                    {bug.status.replace('_', ' ')}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{bug.reporter?.name || 'Unknown'}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {DateTime.fromISO(bug.created).toRelative()}
                </Text>
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Button
                        size="xs"
                        variant="light"
                        onClick={() => handleViewDetails(bug)}
                    >
                        View
                    </Button>
                    <Select
                        size="xs"
                        value={bug.status}
                        data={STATUS_OPTIONS.slice(1)}
                        onChange={(value) => value && handleStatusChange(bug.uuid, value)}
                        disabled={updateBugReportApi.loading}
                    />
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="md" m={'xs'}>
            <Group justify="space-between">
                <Text size="xl" fw={700}>Bug Reports</Text>
                <Select
                    placeholder="Filter by status"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value || '')}
                    data={STATUS_OPTIONS}
                    clearable
                    w={200}
                />
            </Group>

            <ScrollArea>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Bug Report</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Reporter</Table.Th>
                            <Table.Th>Created</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text ta="center" c="dimmed">No bug reports found</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>

            <Modal
                opened={detailModal}
                onClose={() => setDetailModal(false)}
                title="Bug Report Details"
                size="lg"
            >
                {selectedBug && (
                    <Stack gap="md">
                        <Box>
                            <Text fw={500} mb="xs">Title</Text>
                            <Text>{selectedBug.title}</Text>
                        </Box>
                        
                        <Box>
                            <Text fw={500} mb="xs">Description</Text>
                            <Textarea
                                value={selectedBug.description}
                                readOnly
                                autosize
                                minRows={3}
                            />
                        </Box>
                        
                        <Group>
                            <Box>
                                <Text fw={500} mb="xs">Status</Text>
                                <Badge color={STATUS_COLORS[selectedBug.status]}>
                                    {selectedBug.status.replace('_', ' ')}
                                </Badge>
                            </Box>
                            
                            <Box>
                                <Text fw={500} mb="xs">Reporter</Text>
                                <Text>{selectedBug.reporter?.name || 'Unknown'}</Text>
                            </Box>
                        </Group>
                        
                        <Group>
                            <Box>
                                <Text fw={500} mb="xs">Created</Text>
                                <Text size="sm">
                                    {DateTime.fromISO(selectedBug.created).toLocaleString(DateTime.DATETIME_MED)}
                                </Text>
                            </Box>
                            
                            <Box>
                                <Text fw={500} mb="xs">Updated</Text>
                                <Text size="sm">
                                    {DateTime.fromISO(selectedBug.updated).toLocaleString(DateTime.DATETIME_MED)}
                                </Text>
                            </Box>
                        </Group>

                        {selectedBug.posthogEventId && (
                            <Box>
                                <Text fw={500} mb="xs">PostHog Event ID</Text>
                                <Text size="sm" ff="monospace">{selectedBug.posthogEventId}</Text>
                            </Box>
                        )}
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
}
