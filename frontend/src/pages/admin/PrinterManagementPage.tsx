import {
    Alert,
    Badge,
    Card,
    Group,
    Stack,
    Table,
    Text,
    Title,
    Loader,
    Grid,
    Select
} from "@mantine/core";
import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import {IconPrinter, IconAlertCircle, IconCheck, IconX} from "@tabler/icons-react";
import PrinterApi from "src/services/printerApi.tsx";


export default function PrinterManagementPage() {
    const getConfiguredPrinterIdApi = useApi(PrinterApi.getConfiguredPrinterId);
    const getAllPrintersApi = useApi(PrinterApi.getAllPrinters);
    const getPrinterJobsApi = useApi(PrinterApi.getPrintJobs);
    
    const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);

    useEffect(() => {
        getConfiguredPrinterIdApi.request();
    }, []);

    useEffect(() => {
        setSelectedPrinterId(getConfiguredPrinterIdApi.data + "");
    }, [getConfiguredPrinterIdApi.data]);

    const refreshData = () => {
        getAllPrintersApi.request();
    };

    useEffect(() => {
        refreshData();
        if (selectedPrinterId) {
            getPrinterJobsApi.request(selectedPrinterId);
        }
    }, [selectedPrinterId]);

    const formatDateTime = (dateString: string) => {
        return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy HH:mm');
    };

    const getStateColor = (state: string) => {
        switch (state?.toLowerCase()) {
            case 'online':
                return 'green';
            case 'offline':
                return 'red';
            case 'completed':
                return 'blue';
            case 'error':
                return 'red';
            case 'pending':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    const getStateIcon = (state: string) => {
        switch (state?.toLowerCase()) {
            case 'online':
                return <IconCheck size={16} />;
            case 'offline':
                return <IconX size={16} />;
            case 'error':
                return <IconAlertCircle size={16} />;
            default:
                return null;
        }
    };

    // Get all printers and find the configured one
    const allPrinters = getAllPrintersApi.data || [];
    const currentPrinter = allPrinters.find(p => p.id?.toString() === selectedPrinterId) || 
                          allPrinters[0];

    const isCurrentPrinterOnline = currentPrinter?.state?.toLowerCase() === 'online';

    // Create dropdown options for printer selection
    const printerOptions = allPrinters.map(printer => ({
        value: printer.id?.toString() || '',
        label: `${printer.name} ${printer.default ? '(Default)' : ''}`,
    }));

    return (
        <Stack gap="md" m={'sm'}>
            <Group justify="space-between" align="center">
                <Title order={2}>Printer Management</Title>
                <Select
                    label="Select Printer"
                    placeholder="Choose a printer"
                    data={printerOptions}
                    value={selectedPrinterId || currentPrinter?.id?.toString() || ''}
                    onChange={setSelectedPrinterId}
                    disabled={getAllPrintersApi.loading || printerOptions.length === 0}
                />
            </Group>
            {!isCurrentPrinterOnline && currentPrinter && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Printer Status Warning"
                    color="orange"
                >
                    The selected printer appears to be offline. Labels may not print properly.
                </Alert>
            )}

            {/* Printer Status Card */}
            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Text fw={500}>Printer Status</Text>
                    <IconPrinter size={20} />
                </Group>

                        {getAllPrintersApi.loading ? (
                            <Loader size="sm" />
                        ) : currentPrinter ? (
                            <Stack gap="sm">
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Name:</Text>
                                    <Text size="sm">{currentPrinter.name}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Description:</Text>
                                    <Text size="sm">{currentPrinter.description || 'N/A'}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Computer:</Text>
                                    <Group>
                                        <Text size="sm">{currentPrinter.computer.name || 'Unknown'} </Text>
                                        <Badge variant={'outline'}>{currentPrinter.computer?.state}</Badge>
                                    </Group>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Status:</Text>
                                    <Badge
                                        color={getStateColor(currentPrinter.state)}
                                        leftSection={getStateIcon(currentPrinter.state)}
                                    >
                                        {currentPrinter.state || 'Unknown'}
                                    </Badge>
                                </Group>
                            </Stack>
                        ) : (
                            <Text c="dimmed">No printers found</Text>
                        )}
            </Card>
                    </Grid.Col>
                </Grid>

            {/* Print Jobs Table */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} mb="md">
                    Recent Print Jobs {currentPrinter ? `- ${currentPrinter.name}` : ''}
                </Text>
                
                {getPrinterJobsApi.loading ? (
                    <Loader size="sm" />
                ) : (getPrinterJobsApi?.data?.length || 0) > 0 ? (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Job ID</Table.Th>
                                <Table.Th>Title</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Created</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {getPrinterJobsApi.data?.slice(0, 20).map((job) => (
                                <Table.Tr key={job.id}>
                                    <Table.Td>{job.id}</Table.Td>
                                    <Table.Td>{job.title}</Table.Td>
                                    <Table.Td>
                                        <Badge color={getStateColor(job.state)} size="sm">
                                            {job.state}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>{job.createTimestamp && formatDateTime(job.createTimestamp)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Text c="dimmed">No recent print jobs</Text>
                )}
            </Card>
        </Stack>
    );
}
