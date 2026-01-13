import {
    Center,
    Group,
    LoadingOverlay,
    Pagination,
    Table,
    TextInput,
    Select,
    Badge,
    Button,
    Modal,
    Checkbox,
    Stack,
    Text,
    Alert
} from '@mantine/core';
import {IconSearch, IconFlag, IconX, IconGitMerge, IconInfoCircle} from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useApi from 'src/hooks/useApi.tsx';
import customersApi from 'src/services/customersApi.tsx';
import { Customer } from 'src/models/types.tsx';
import { DateTime } from 'luxon';

export default function CustomerManagementPage() {
    const getCustomers = useApi(customersApi.getCustomers);
    const mergeCustomers = useApi(customersApi.mergeCustomers);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    /* ---------- merge state ---------- */
    const [mergeMode, setMergeMode] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
    const [mergeModalOpen, setMergeModalOpen] = useState(false);

    /* ---------- query‑param state ---------- */
    const page       = Number(searchParams.get('page')) || 1;
    const nameFilter = searchParams.get('name') || '';
    const flaggedStr = searchParams.get('flagged');        // "true" | "false" | null
    const flagged    = flaggedStr === null ? null : flaggedStr === 'true';

    const [nameSearch, setNameSearch] = useState(nameFilter);
    const [debouncedName] = useDebouncedValue(nameSearch, 500);

    /* ---------- fetch whenever filters change ---------- */
    useEffect(() => {
        getCustomers.request(
            page - 1,
            10,
        {
            name: debouncedName || null,
            flagged
        });
    }, [page, debouncedName, flagged]);

    /* ---------- clear selections when search/filter changes ---------- */
    useEffect(() => {
        if (mergeMode) {
            setSelectedCustomers([]);
        }
    }, [page, debouncedName, flagged]);

    /* ---------- param helpers ---------- */
    const setPage = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', p.toString());
        setSearchParams(params, { replace: true });
    };

    const setNameParam = (val: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('name', val);
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    const setFlaggedParam = (val: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (val === null) params.delete('flagged');
        else params.set('flagged', val);
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    /* ---------- merge helpers ---------- */
    const handleCustomerSelect = (customer: Customer, checked: boolean) => {
        if (checked) {
            setSelectedCustomers(prev => [...prev, customer]);
        } else {
            setSelectedCustomers(prev => prev.filter(c => c.uuid !== customer.uuid));
        }
    };

    const handleMerge = () => {
        if (selectedCustomers.length === 2) {
            setMergeModalOpen(true);
        }
    };

    const confirmMerge = async (fromCustomerUuid: string, toCustomerUuid: string) => {
        try {
            await mergeCustomers.request({ fromCustomerUuid, toCustomerUuid });
            setMergeModalOpen(false);
            setMergeMode(false);
            setSelectedCustomers([]);
            // Refresh the customer list
            getCustomers.request(page - 1, 10, { name: debouncedName || null, flagged });
        } catch (error) {
            console.error('Merge failed:', error);
        }
    };

    /* ---------- table rows ---------- */
    // Filter selectedCustomers to only include those visible on current page
    const currentPageCustomerUuids = new Set(getCustomers.data?.content?.map(c => c.uuid) || []);
    const visibleSelectedCustomers = selectedCustomers.filter(sc => currentPageCustomerUuids.has(sc.uuid));
    
    const rows = getCustomers.data?.content?.map((c: Customer) => {
        const isSelected = selectedCustomers.some(sc => sc.uuid === c.uuid);
        return (
            <Table.Tr
                key={c.uuid}
                style={{ cursor: mergeMode ? 'default' : 'pointer', backgroundColor: isSelected ? '#f1f3f4' : undefined }}
                onClick={(e) => {
                    if (!mergeMode) {
                        navigate(`/customer/${c.uuid}`);
                    }
                }}
            >
                {mergeMode && (
                    <Table.Td>
                        <Checkbox
                            checked={isSelected}
                            disabled={!isSelected && selectedCustomers.length >= 2}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleCustomerSelect(c, e.currentTarget.checked);
                            }}
                        />
                    </Table.Td>
                )}
                <Table.Td>{c.firstName}</Table.Td>
                <Table.Td>{c.lastName}</Table.Td>
                <Table.Td>{c.flagged && <IconFlag color="red" />}</Table.Td>
                <Table.Td>{DateTime.fromMillis(c.created).toLocaleString(DateTime.DATETIME_SHORT)}</Table.Td>
            </Table.Tr>
        );
    });

    return (
        <>
            <Group m="xs" justify="space-between" wrap="wrap">
                <Group gap="sm">
                    <TextInput
                        placeholder="Search customer name"
                        leftSection={<IconSearch size={16} />}
                        value={nameSearch}
                        onChange={(e) => {
                            setNameSearch(e.currentTarget.value);
                            setNameParam(e.currentTarget.value);
                        }}
                    />

                    <Select
                        data={[
                            { value: 'true',  label: 'Flagged only' },
                            { value: 'false', label: 'Not flagged' }
                        ]}
                        placeholder="Flagged?"
                        clearable
                        value={flaggedStr}
                        onChange={(v) => setFlaggedParam(v)}
                    />

                    {flaggedStr && (
                        <Badge
                            rightSection={
                                <IconX
                                    size={12}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setFlaggedParam(null)}
                                />
                            }
                            variant="outline"
                        >
                            {flaggedStr === 'true' ? 'Flagged only' : 'Not flagged'}
                        </Badge>
                    )}
                </Group>

                <Group gap="sm">
                    {mergeMode ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setMergeMode(false);
                                    setSelectedCustomers([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                leftSection={<IconGitMerge size={16} />}
                                disabled={selectedCustomers.length !== 2}
                                onClick={handleMerge}
                            >
                                Merge Selected ({selectedCustomers.length}/2)
                            </Button>
                        </>
                    ) : (
                        <Button
                            leftSection={<IconGitMerge size={16} />}
                            variant="outline"
                            onClick={() => setMergeMode(true)}
                            disabled={true}
                        >
                            Merge Customers
                        </Button>
                    )}
                </Group>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        {mergeMode && <Table.Th>Select</Table.Th>}
                        <Table.Th>First</Table.Th>
                        <Table.Th>Last</Table.Th>
                        <Table.Th><IconFlag /></Table.Th>
                        <Table.Th>Created</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>

            {1 < (getCustomers.data?.totalPages || 0) && (
                <Center>
                    <Pagination value={page}
                                withEdges={true}
                                onChange={setPage}
                                total={getCustomers.data?.totalPages || 0} />
                </Center>
            )}

            <LoadingOverlay visible={getCustomers.loading} />

            <Modal
                opened={mergeModalOpen}
                onClose={() => setMergeModalOpen(false)}
                title="Confirm Customer Merge"
                size="lg"
            >
                <Stack gap="md">
                    <Alert icon={<IconInfoCircle />} color="blue">
                        This action will merge two customer records. All orders and shower reservations will be transferred to the target customer, and the source customer will be deleted.
                    </Alert>

                    <Text size="sm" fw={500}>Select which customer to keep:</Text>

                    {selectedCustomers.map((customer, index) => (
                        <Button
                            key={customer.uuid}
                            variant="outline"
                            size="md"
                            fullWidth
                            onClick={() => {
                                const otherCustomer = selectedCustomers.find(c => c.uuid !== customer.uuid);
                                if (otherCustomer) {
                                    confirmMerge(otherCustomer.uuid, customer.uuid);
                                }
                            }}
                        >
                            Keep: {customer.firstName} {customer.lastName}
                            <br />
                            <small>Created: {DateTime.fromMillis(customer.created).toLocaleString(DateTime.DATETIME_SHORT)}</small>
                        </Button>
                    ))}

                    <Group justify="flex-end" gap="sm">
                        <Button variant="outline" onClick={() => setMergeModalOpen(false)}>
                            Cancel
                        </Button>
                    </Group>

                    <LoadingOverlay visible={mergeCustomers.loading} />
                </Stack>
            </Modal>
        </>
    );
}
