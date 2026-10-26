import {
    ActionIcon,
    Anchor,
    Badge,
    Box,
    Button,
    Card,
    Group,
    Pagination,
    Paper,
    ScrollArea,
    SegmentedControl,
    Select,
    Skeleton,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import {DatePickerInput} from '@mantine/dates';
import {useDebouncedValue, useDisclosure} from '@mantine/hooks';
import {modals} from '@mantine/modals';
import {IconArrowLeft, IconPlus, IconRepeat, IconSearch, IconTrash} from '@tabler/icons-react';
import {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {DateTime} from 'luxon';

import useApi from 'src/hooks/useApi';
import CustomersApi from 'src/services/customersApi';
import {Category, categoryDisplayNames, CustomerItemHistoryRow, HistoryFillFilter} from 'src/models/types.tsx';
import GroupedAttributeBadges from 'src/components/common/items/GroupedAttributeBadges';
import RecordPickupModal from 'src/components/customer/RecordPickupModal.tsx';
import {formatLimitRule, LIMIT_ZONE} from 'src/utils/ItemLimitUtils.tsx';

const PAGE_SIZE = 25;

const formatReceived = (row: CustomerItemHistoryRow): string =>
    row.source === 'RECORDED' && row.entry
        ? DateTime.fromISO(row.entry.receivedOn).toLocaleString(DateTime.DATE_MED)
        : DateTime.fromISO(row.receivedAt).setZone(LIMIT_ZONE).toLocaleString(DateTime.DATE_MED);

/**
 * Everything a customer has received or asked for: lines from completed orders (filled or not)
 * and pickups recorded by hand.
 */
const CustomerItemHistoryPage = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const customerRequest = useApi(CustomersApi.getCustomer);
    const historyRequest = useApi(CustomersApi.getItemHistory);
    const deleteEntryRequest = useApi(CustomersApi.deleteItemLimitEntry);
    const [recordOpened, {open: openRecord, close: closeRecord}] = useDisclosure(false);

    // Filters start from the URL so other pages can link here pre-filtered, e.g. ?limited=true
    const [limitedOnly, setLimitedOnly] = useState(searchParams.get('limited') === 'true');
    const [fill, setFill] = useState<HistoryFillFilter>(
        (searchParams.get('fill')?.toUpperCase() as HistoryFillFilter | undefined) ?? 'ALL');
    const [category, setCategory] = useState<string | null>(searchParams.get('category'));
    const [search, setSearch] = useState(searchParams.get('q') ?? '');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (uuid) customerRequest.request(uuid);
    }, [uuid]);

    const loadHistory = () => {
        if (!uuid) return;
        historyRequest.request(uuid, page - 1, PAGE_SIZE, {
            limitedOnly,
            fill,
            category,
            q: debouncedSearch || undefined,
            from: dateRange[0],
            to: dateRange[1],
        });
    };

    const filtersKey = JSON.stringify([limitedOnly, fill, category, debouncedSearch, dateRange]);
    const lastFiltersKey = useRef(filtersKey);

    useEffect(() => {
        // Changing a filter goes back to the first page; that page change triggers the load
        if (lastFiltersKey.current !== filtersKey) {
            lastFiltersKey.current = filtersKey;
            if (page !== 1) {
                setPage(1);
                return;
            }
        }
        loadHistory();
    }, [uuid, page, filtersKey]);

    // Keep the URL in step so the filtered view can be shared or refreshed
    useEffect(() => {
        const params: Record<string, string> = {};
        if (limitedOnly) params.limited = 'true';
        if (fill !== 'ALL') params.fill = fill.toLowerCase();
        if (category) params.category = category;
        if (debouncedSearch) params.q = debouncedSearch;
        setSearchParams(params, {replace: true});
    }, [limitedOnly, fill, category, debouncedSearch]);

    const confirmDelete = (row: CustomerItemHistoryRow) => modals.openConfirmModal({
        title: 'Delete recorded pickup',
        children: (
            <Text size="sm" mt={'xs'}>
                Delete the {row.item.description} pickup recorded for <strong>{formatReceived(row)}</strong>?
            </Text>
        ),
        labels: {confirm: 'Delete', cancel: 'Cancel'},
        confirmProps: {color: 'red'},
        onConfirm: () => {
            deleteEntryRequest.request(uuid!, row.entry!.id).then(loadHistory);
        },
    });

    const rows = historyRequest.data?.content ?? [];
    const customer = customerRequest.data;

    const renderItem = (row: CustomerItemHistoryRow) => (
        <Stack gap={2}>
            <Group gap="xs" wrap="wrap">
                <Text fw={500} size="sm">{row.item.description}</Text>
                {row.item.limit && (
                    <Tooltip label={`Limited item: ${formatLimitRule(row.item.limit)}`} withArrow>
                        <Badge size="xs" variant="light" color="gray" leftSection={<IconRepeat size={9}/>}>
                            Limited
                        </Badge>
                    </Tooltip>
                )}
            </Group>
            {Object.keys(row.attributes).length > 0 && (
                <GroupedAttributeBadges attrs={row.attributes} itemAttributes={row.item.attributes}/>
            )}
            {row.notes && <Text size="xs" c="dimmed" style={{fontStyle: 'italic'}}>{row.notes}</Text>}
        </Stack>
    );

    const renderQuantity = (row: CustomerItemHistoryRow) => {
        const fulfilled = row.quantityFulfilled ?? 0;
        if (fulfilled >= row.quantityRequested) {
            return <Badge variant="light" color="green" size="sm">{fulfilled} received</Badge>;
        }
        return (
            <Badge variant="light" color="orange" size="sm">
                {fulfilled === 0 ? 'Not filled' : `${fulfilled} of ${row.quantityRequested}`}
            </Badge>
        );
    };

    const renderSource = (row: CustomerItemHistoryRow) => row.source === 'ORDER' ? (
        <Anchor size="sm" onClick={() => navigate(`/order/${row.orderId}`)}>Order #{row.orderId}</Anchor>
    ) : (
        <Group gap={4} wrap="nowrap">
            <Text size="sm" c="dimmed">
                Recorded{row.entry?.createdBy ? ` by ${row.entry.createdBy.name}` : ''}
            </Text>
            <Tooltip label="Delete recorded pickup" withArrow>
                <ActionIcon size="sm" variant="subtle" color="red" disabled={deleteEntryRequest.loading}
                            onClick={() => confirmDelete(row)} aria-label="Delete recorded pickup">
                    <IconTrash size={14}/>
                </ActionIcon>
            </Tooltip>
        </Group>
    );

    return (
        <Stack gap="md" px="xs" m={'xs'}>
            <RecordPickupModal customerUuid={uuid!} opened={recordOpened} onClose={closeRecord} onSaved={loadHistory}/>

            <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                    <ActionIcon variant="subtle" onClick={() => navigate(`/customer/${uuid}`)} aria-label="Back to customer">
                        <IconArrowLeft size={18}/>
                    </ActionIcon>
                    <Title order={3}>
                        Item history{customer ? ` · ${customer.firstName} ${customer.lastName ?? ''}` : ''}
                    </Title>
                </Group>
                <Button size="xs" variant="light" leftSection={<IconPlus size={14}/>} onClick={openRecord}>
                    Record past pickup
                </Button>
            </Group>

            <Card withBorder padding="sm" radius="md">
                <Group gap="sm" align="end" wrap="wrap">
                    <TextInput
                        label="Item"
                        placeholder="Search items"
                        leftSection={<IconSearch size={16} stroke={1.5}/>}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        w={{base: '100%', sm: 200}}
                    />
                    <Select
                        label="Category"
                        placeholder="All categories"
                        clearable
                        data={Object.values(Category).map((c) => ({label: categoryDisplayNames[c], value: c.toString()}))}
                        value={category}
                        onChange={setCategory}
                        w={{base: '100%', sm: 180}}
                    />
                    <DatePickerInput
                        type="range"
                        label="Dates"
                        placeholder="Any time"
                        clearable
                        value={dateRange}
                        onChange={(value) => setDateRange(value as [string | null, string | null])}
                        maxDate={new Date()}
                        w={{base: '100%', sm: 240}}
                    />
                    <SegmentedControl
                        value={fill}
                        onChange={(value) => setFill(value as HistoryFillFilter)}
                        data={[
                            {value: 'ALL', label: 'All'},
                            {value: 'RECEIVED', label: 'Received'},
                            {value: 'UNFILLED', label: 'Not filled'},
                        ]}
                    />
                    <Switch label="Limited items only" checked={limitedOnly} pb={8}
                            onChange={(e) => setLimitedOnly(e.currentTarget.checked)}/>
                </Group>
            </Card>

            {historyRequest.loading && !historyRequest.data ? (
                <Stack gap="sm">
                    {[...Array(4)].map((_, idx) => <Skeleton height={36} radius="sm" key={idx}/>)}
                </Stack>
            ) : historyRequest.error ? (
                <Text c="red">Failed to load item history.</Text>
            ) : rows.length === 0 ? (
                <Text size="sm" c="dimmed">No items match these filters.</Text>
            ) : (
                <>
                    {/* Desktop: table */}
                    <Box visibleFrom="md">
                        <ScrollArea>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th>Item</Table.Th>
                                        <Table.Th>Received</Table.Th>
                                        <Table.Th>Source</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {rows.map((row, index) => (
                                        <Table.Tr key={`${row.source}-${row.orderId ?? row.entry?.id}-${index}`}>
                                            <Table.Td style={{whiteSpace: 'nowrap'}}>
                                                <Text size="sm">{formatReceived(row)}</Text>
                                            </Table.Td>
                                            <Table.Td>{renderItem(row)}</Table.Td>
                                            <Table.Td>{renderQuantity(row)}</Table.Td>
                                            <Table.Td>{renderSource(row)}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Box>

                    {/* Mobile: cards */}
                    <Stack gap="xs" hiddenFrom="md">
                        {rows.map((row, index) => (
                            <Paper key={`${row.source}-${row.orderId ?? row.entry?.id}-${index}`} p="sm" withBorder radius="sm">
                                <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
                                    {renderItem(row)}
                                    {renderQuantity(row)}
                                </Group>
                                <Group justify="space-between" wrap="nowrap">
                                    <Text size="xs" c="dimmed">{formatReceived(row)}</Text>
                                    {renderSource(row)}
                                </Group>
                            </Paper>
                        ))}
                    </Stack>

                    {(historyRequest.data?.totalPages ?? 0) > 1 && (
                        <Pagination value={page} onChange={setPage} total={historyRequest.data?.totalPages ?? 0}/>
                    )}
                </>
            )}
        </Stack>
    );
};

export default CustomerItemHistoryPage;
