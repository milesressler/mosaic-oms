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
    Alert,
    Card,
    ThemeIcon,
    Divider,
} from '@mantine/core';
import {IconSearch, IconFlag, IconX, IconGitMerge, IconInfoCircle, IconTrash, IconCheck} from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useApi from 'src/hooks/useApi.tsx';
import customersApi from 'src/services/customersApi.tsx';
import { Customer } from 'src/models/types.tsx';
import { DateTime } from 'luxon';

type FieldSource = 'kept' | 'deleted';

interface FieldResolutions {
    firstName: FieldSource;
    lastName: FieldSource;
    flagged: FieldSource;
    obfuscateName: FieldSource;
    excludeFromMetrics: FieldSource;
    showerWaiver: FieldSource;
}

const initResolutions = (kept: Customer, deleted: Customer): FieldResolutions => ({
    firstName: 'kept',
    lastName: 'kept',
    // Preserve flag if the deleted customer is flagged and the kept one isn't
    flagged: (!kept.flagged && deleted.flagged) ? 'deleted' : 'kept',
    obfuscateName: 'kept',
    excludeFromMetrics: 'kept',
    // Preserve waiver if kept has no valid waiver but deleted does
    showerWaiver: (!kept.waiverIsValid && deleted.waiverIsValid) ? 'deleted' : 'kept',
});

export default function CustomerManagementPage() {
    const getCustomers = useApi(customersApi.getCustomers);
    const mergeCustomers = useApi(customersApi.mergeCustomers);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    /* ---------- merge state ---------- */
    const [mergeMode, setMergeMode] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
    const [mergeModalOpen, setMergeModalOpen] = useState(false);
    const [mergeTarget, setMergeTarget] = useState<Customer | null>(null);
    const [fieldResolutions, setFieldResolutions] = useState<FieldResolutions>({
        firstName: 'kept', lastName: 'kept', flagged: 'kept',
        obfuscateName: 'kept', excludeFromMetrics: 'kept', showerWaiver: 'kept',
    });

    /* ---------- query‑param state ---------- */
    const page       = Number(searchParams.get('page')) || 1;
    const nameFilter = searchParams.get('name') || '';
    const flaggedStr = searchParams.get('flagged');
    const flagged    = flaggedStr === null ? null : flaggedStr === 'true';

    const [nameSearch, setNameSearch] = useState(nameFilter);
    const [debouncedName] = useDebouncedValue(nameSearch, 500);

    /* ---------- fetch whenever filters change ---------- */
    useEffect(() => {
        getCustomers.request(page - 1, 10, { name: debouncedName || null, flagged });
    }, [page, debouncedName, flagged]);

    /* ---------- clear selections when search/filter/page changes ---------- */
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

    const handleSetMergeTarget = (target: Customer) => {
        const other = selectedCustomers.find(c => c.uuid !== target.uuid)!;
        setFieldResolutions(initResolutions(target, other));
        setMergeTarget(target);
    };

    const closeMergeModal = () => {
        setMergeModalOpen(false);
        setMergeTarget(null);
    };

    const confirmMerge = async () => {
        if (!mergeTarget) return;
        const mergeSource = selectedCustomers.find(c => c.uuid !== mergeTarget.uuid);
        if (!mergeSource) return;

        const pick = <T,>(f: FieldSource, kept: T, deleted: T): T => f === 'kept' ? kept : deleted;
        const resolvedWaiverMillis = pick(
            fieldResolutions.showerWaiver,
            mergeTarget.showerWaiverCompleted,
            mergeSource.showerWaiverCompleted
        );

        try {
            await mergeCustomers.request({
                fromCustomerUuid: mergeSource.uuid,
                toCustomerUuid: mergeTarget.uuid,
                firstName: pick(fieldResolutions.firstName, mergeTarget.firstName, mergeSource.firstName),
                lastName: pick(fieldResolutions.lastName, mergeTarget.lastName, mergeSource.lastName),
                flagged: pick(fieldResolutions.flagged, mergeTarget.flagged, mergeSource.flagged),
                obfuscateName: pick(fieldResolutions.obfuscateName, mergeTarget.obfuscatedName, mergeSource.obfuscatedName),
                excludeFromMetrics: pick(fieldResolutions.excludeFromMetrics, mergeTarget.excludeFromMetrics, mergeSource.excludeFromMetrics),
                ...(resolvedWaiverMillis ? { showerWaiverSigned: new Date(resolvedWaiverMillis).toISOString() } : {}),
            });
            closeMergeModal();
            setMergeMode(false);
            setSelectedCustomers([]);
            getCustomers.request(page - 1, 10, { name: debouncedName || null, flagged });
        } catch (error) {
            console.error('Merge failed:', error);
        }
    };

    const formatWaiver = (customer: Customer): string => {
        if (!customer.showerWaiverCompleted) return 'No waiver';
        const date = DateTime.fromMillis(customer.showerWaiverCompleted).toLocaleString(DateTime.DATE_MED);
        return customer.waiverIsValid ? `Valid (${date})` : `Expired (${date})`;
    };

    const renderFieldRow = (
        field: keyof FieldResolutions,
        label: string,
        keptVal: string,
        deletedVal: string,
        keptDisabled?: boolean,
        deletedDisabled?: boolean,
    ) => {
        const same = keptVal === deletedVal;
        return (
            <Table.Tr key={field}>
                <Table.Td><Text size="xs" fw={500}>{label}</Text></Table.Td>
                {same ? (
                    <Table.Td colSpan={2}>
                        <Text size="xs" c="dimmed">{keptVal}</Text>
                    </Table.Td>
                ) : (
                    <>
                        <Table.Td>
                            <Button
                                size="compact-xs"
                                variant={fieldResolutions[field] === 'kept' ? 'filled' : 'subtle'}
                                color="green"
                                disabled={keptDisabled}
                                onClick={() => setFieldResolutions(r => ({ ...r, [field]: 'kept' as FieldSource }))}
                            >
                                {keptVal}
                            </Button>
                        </Table.Td>
                        <Table.Td>
                            <Button
                                size="compact-xs"
                                variant={fieldResolutions[field] === 'deleted' ? 'filled' : 'subtle'}
                                color="green"
                                disabled={deletedDisabled}
                                onClick={() => setFieldResolutions(r => ({ ...r, [field]: 'deleted' as FieldSource }))}
                            >
                                {deletedVal}
                            </Button>
                        </Table.Td>
                    </>
                )}
            </Table.Tr>
        );
    };

    /* ---------- table rows ---------- */
    const rows = getCustomers.data?.content?.map((c: Customer) => {
        const isSelected = selectedCustomers.some(sc => sc.uuid === c.uuid);
        return (
            <Table.Tr
                key={c.uuid}
                style={{ cursor: mergeMode ? 'default' : 'pointer', backgroundColor: isSelected ? '#f1f3f4' : undefined }}
                onClick={() => {
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
                        >
                            Merge Customers
                        </Button>
                    )}
                </Group>
            </Group>

            {mergeMode && (
                <Alert icon={<IconInfoCircle />} color="blue" variant="light" mx="xs" mb="xs" p="xs">
                    <Text size="xs">Search by name to find duplicates. You can only select customers visible on the current page.</Text>
                </Alert>
            )}

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
                onClose={closeMergeModal}
                title="Merge Customers"
                size="lg"
            >
                <Stack gap="md">
                    <LoadingOverlay visible={mergeCustomers.loading} />

                    {!mergeTarget ? (
                        <>
                            <Alert icon={<IconInfoCircle />} color="blue">
                                Select which customer record to <strong>keep</strong>. The other record will be permanently deleted and all of their orders and shower reservations will be transferred to the kept record.
                            </Alert>
                            <Text size="sm" fw={500}>Which customer do you want to keep?</Text>
                            <Group grow align="stretch">
                                {selectedCustomers.map((customer) => (
                                    <Card key={customer.uuid} withBorder padding="md">
                                        <Stack gap="xs">
                                            <Text fw={600}>{customer.firstName} {customer.lastName}</Text>
                                            <Text size="xs" c="dimmed">Created: {DateTime.fromMillis(customer.created).toLocaleString(DateTime.DATETIME_SHORT)}</Text>
                                            {customer.waiverIsValid && (
                                                <Text size="xs" c="teal">Waiver: {formatWaiver(customer)}</Text>
                                            )}
                                            {customer.flagged && (
                                                <Text size="xs" c="red">Flagged</Text>
                                            )}
                                            <Button
                                                leftSection={<IconCheck size={14} />}
                                                variant="light"
                                                color="green"
                                                size="xs"
                                                mt="xs"
                                                onClick={() => handleSetMergeTarget(customer)}
                                            >
                                                Keep this customer
                                            </Button>
                                        </Stack>
                                    </Card>
                                ))}
                            </Group>
                            <Group justify="flex-end">
                                <Button variant="outline" onClick={closeMergeModal}>Cancel</Button>
                            </Group>
                        </>
                    ) : (() => {
                        const mergeSource = selectedCustomers.find(c => c.uuid !== mergeTarget.uuid)!;
                        return (
                            <>
                                <Group grow align="stretch">
                                    <Card withBorder padding="md" style={{ borderColor: 'var(--mantine-color-green-5)' }}>
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <ThemeIcon color="green" variant="light" size="sm">
                                                    <IconCheck size={12} />
                                                </ThemeIcon>
                                                <Text size="xs" fw={600} c="green">KEEPING</Text>
                                            </Group>
                                            <Text fw={600}>{mergeTarget.firstName} {mergeTarget.lastName}</Text>
                                            <Text size="xs" c="dimmed">Created: {DateTime.fromMillis(mergeTarget.created).toLocaleString(DateTime.DATETIME_SHORT)}</Text>
                                        </Stack>
                                    </Card>
                                    <Card withBorder padding="md" style={{ borderColor: 'var(--mantine-color-red-5)' }}>
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <ThemeIcon color="red" variant="light" size="sm">
                                                    <IconTrash size={12} />
                                                </ThemeIcon>
                                                <Text size="xs" fw={600} c="red">DELETING</Text>
                                            </Group>
                                            <Text fw={600}>{mergeSource.firstName} {mergeSource.lastName}</Text>
                                            <Text size="xs" c="dimmed">Created: {DateTime.fromMillis(mergeSource.created).toLocaleString(DateTime.DATETIME_SHORT)}</Text>
                                        </Stack>
                                    </Card>
                                </Group>

                                <Divider label="Resolve properties for merged record" labelPosition="center" />

                                <Table withColumnBorders withRowBorders fz="xs">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th w={130}>Field</Table.Th>
                                            <Table.Th>
                                                <Text size="xs" c="green" fw={600}>{mergeTarget.firstName} {mergeTarget.lastName}</Text>
                                            </Table.Th>
                                            <Table.Th>
                                                <Text size="xs" c="dimmed" fw={600}>{mergeSource.firstName} {mergeSource.lastName}</Text>
                                            </Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {renderFieldRow('firstName', 'First Name', mergeTarget.firstName, mergeSource.firstName)}
                                        {renderFieldRow('lastName', 'Last Name', mergeTarget.lastName, mergeSource.lastName)}
                                        {renderFieldRow('flagged', 'Flagged', mergeTarget.flagged ? 'Yes' : 'No', mergeSource.flagged ? 'Yes' : 'No')}
                                        {renderFieldRow('showerWaiver', 'Shower Waiver', formatWaiver(mergeTarget), formatWaiver(mergeSource), false, !mergeSource.showerWaiverCompleted && !!mergeTarget.showerWaiverCompleted)}
                                        {renderFieldRow('obfuscateName', 'Obfuscate Name', mergeTarget.obfuscatedName ? 'Yes' : 'No', mergeSource.obfuscatedName ? 'Yes' : 'No')}
                                        {renderFieldRow('excludeFromMetrics', 'Excl. Metrics', mergeTarget.excludeFromMetrics ? 'Yes' : 'No', mergeSource.excludeFromMetrics ? 'Yes' : 'No')}
                                    </Table.Tbody>
                                </Table>

                                <Alert icon={<IconInfoCircle />} color="orange" title="This cannot be undone">
                                    The deleted record will be permanently removed. Orders and shower reservations will be transferred to the kept record.
                                </Alert>

                                <Group justify="flex-end" gap="sm">
                                    <Button variant="subtle" onClick={() => setMergeTarget(null)}>Back</Button>
                                    <Button variant="outline" onClick={closeMergeModal}>Cancel</Button>
                                    <Button
                                        color="red"
                                        leftSection={<IconGitMerge size={16} />}
                                        onClick={confirmMerge}
                                    >
                                        Confirm Merge
                                    </Button>
                                </Group>
                            </>
                        );
                    })()}
                </Stack>
            </Modal>
        </>
    );
}
