import {useEffect, useMemo, useState} from "react";
import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Group,
    Loader,
    Modal,
    NumberInput,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip
} from "@mantine/core";
import {DateInput} from "@mantine/dates";
import {modals} from "@mantine/modals";
import {
    IconAlertTriangle,
    IconArchive,
    IconArchiveOff,
    IconArrowDown,
    IconArrowUp,
    IconPencil,
    IconPlayerPlay,
    IconPlayerStop,
    IconPlus,
    IconTrash
} from "@tabler/icons-react";
import useApi from "src/hooks/useApi.tsx";
import specialEventsApi from "src/services/specialEventsApi.tsx";
import itemsApi from "src/services/itemsApi.tsx";
import {Item, SpecialEvent, SpecialEventRequest} from "src/models/types.tsx";

interface DraftItem {
    item: Item;
    quantityAvailable: number | null;
}

interface Draft {
    /** Null for a new event */
    uuid: string | null;
    name: string;
    eventDate: string | null;
    itemsPerGuest: number;
    items: DraftItem[];
}

const emptyDraft = (): Draft => ({uuid: null, name: '', eventDate: null, itemsPerGuest: 1, items: []});

const errorMessage = (err: unknown): string =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong. Try again.';

export function SpecialEventsPage() {
    const eventsApi = useApi(specialEventsApi.getEvents);
    const [events, setEvents] = useState<SpecialEvent[]>([]);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [error, setError] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const visibleEvents = events.filter((e) => showArchived || !e.archived);
    const archivedCount = events.filter((e) => e.archived).length;

    const loadEvents = () => {
        eventsApi.request().then((result) => result && setEvents(result.data));
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const setActive = (uuid: string | null) => {
        setError('');
        specialEventsApi.setActiveEvent(uuid)
            .then((result) => setEvents(result.data))
            .catch((err) => setError(errorMessage(err)));
    };

    const confirmStart = (event: SpecialEvent) => {
        const running = events.find((e) => e.active);
        modals.openConfirmModal({
            title: `Start ${event.name}?`,
            children: <Text size="sm">
                Order takers will be sent to the {event.name} page, and its orders will go straight to the distributor.
                {running && ` This stops ${running.name}.`}
            </Text>,
            labels: {confirm: 'Start event', cancel: 'Cancel'},
            onConfirm: () => setActive(event.uuid),
        });
    };

    const confirmStop = (event: SpecialEvent) => {
        modals.openConfirmModal({
            title: `Stop ${event.name}?`,
            children: <Text size="sm">Order takers go back to the regular order page. Orders already taken stay ready for pickup.</Text>,
            labels: {confirm: 'Stop event', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: () => setActive(null),
        });
    };

    const setArchived = (event: SpecialEvent, archived: boolean) => {
        setError('');
        specialEventsApi.setArchived(event.uuid, archived)
            .then((result) => setEvents(result.data))
            .catch((err) => setError(errorMessage(err)));
    };

    const confirmDelete = (event: SpecialEvent) => {
        modals.openConfirmModal({
            title: `Delete ${event.name}?`,
            children: <Text size="sm">This can't be undone.</Text>,
            labels: {confirm: 'Delete', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            onConfirm: () => specialEventsApi.deleteEvent(event.uuid)
                .then(loadEvents)
                .catch((err) => setError(errorMessage(err))),
        });
    };

    const editEvent = (event: SpecialEvent) => setDraft({
        uuid: event.uuid,
        name: event.name,
        eventDate: event.eventDate,
        itemsPerGuest: event.itemsPerGuest,
        items: event.items.map((i) => ({item: i.item, quantityAvailable: i.quantityAvailable})),
    });

    return (
        <Box p="md">
            <Group justify="space-between" mb="md">
                <Title order={3}>Special Events</Title>
                <Button leftSection={<IconPlus size={16}/>} onClick={() => setDraft(emptyDraft())}>New event</Button>
            </Group>
            <Text c="dimmed" size="sm" mb="md">
                While an event is running, order takers pick from only its items, and orders go straight to the
                distributor. Stock counts only this event's orders, so regular orders for the same items aren't affected.
            </Text>

            {error && <Alert color="red" icon={<IconAlertTriangle/>} mb="md" withCloseButton onClose={() => setError('')}>{error}</Alert>}
            {eventsApi.loading && events.length === 0 && <Loader/>}
            {!eventsApi.loading && visibleEvents.length === 0 && <Text c="dimmed">No events yet.</Text>}
            {archivedCount > 0 && (
                <Switch mb="md" label={`Show archived (${archivedCount})`} checked={showArchived}
                        onChange={(e) => setShowArchived(e.currentTarget.checked)}/>
            )}

            <Stack>
                {visibleEvents.map((event) => (
                    <Card key={event.uuid} withBorder padding="md"
                          style={event.active ? {borderColor: 'var(--mantine-color-green-6)', borderWidth: 2} : undefined}>
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                                <Text fw={700} size="lg">{event.name}</Text>
                                {event.active && <Badge color="green">Running</Badge>}
                                {event.archived && <Badge color="gray">Archived</Badge>}
                                {event.eventDate && <Badge variant="light" color="gray">{event.eventDate}</Badge>}
                                <Badge variant="light" color="blue">
                                    {event.itemsPerGuest === 1 ? '1 item per guest' : `${event.itemsPerGuest} items per guest`}
                                </Badge>
                            </Group>
                            <Group gap="xs">
                                {event.active
                                    ? <Button size="xs" color="red" variant="light" leftSection={<IconPlayerStop size={14}/>}
                                              onClick={() => confirmStop(event)}>Stop</Button>
                                    : !event.archived &&
                                    <Button size="xs" color="green" variant="light" leftSection={<IconPlayerPlay size={14}/>}
                                            disabled={event.items.length === 0}
                                            onClick={() => confirmStart(event)}>Start</Button>}
                                {!event.active && (
                                    <Tooltip label={event.archived ? 'Restore from archive' : 'Archive (hide from this list)'}>
                                        <ActionIcon variant="subtle" color="gray"
                                                    aria-label={event.archived ? 'Restore event' : 'Archive event'}
                                                    onClick={() => setArchived(event, !event.archived)}>
                                            {event.archived ? <IconArchiveOff size={18}/> : <IconArchive size={18}/>}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                <ActionIcon variant="subtle" onClick={() => editEvent(event)} aria-label="Edit event">
                                    <IconPencil size={18}/>
                                </ActionIcon>
                                <Tooltip label={event.hasOrders ? 'Events with orders can\'t be deleted. Archive it instead.' : 'Delete event'}>
                                    <ActionIcon variant="subtle" color="red" aria-label="Delete event"
                                                disabled={event.hasOrders || event.active}
                                                onClick={() => confirmDelete(event)}>
                                        <IconTrash size={18}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Item</Table.Th>
                                    <Table.Th>Given out</Table.Th>
                                    <Table.Th>Stock</Table.Th>
                                    <Table.Th>Left</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {event.items.map((i) => (
                                    <Table.Tr key={i.item.id}>
                                        <Table.Td>
                                            {i.item.description}
                                            {i.item.availability !== 'AVAILABLE' &&
                                                <Badge ml="xs" size="xs" color="gray">Unavailable</Badge>}
                                        </Table.Td>
                                        <Table.Td>{i.claimed}</Table.Td>
                                        <Table.Td>{i.quantityAvailable ?? 'No limit'}</Table.Td>
                                        <Table.Td>{i.remaining ?? '-'}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Card>
                ))}
            </Stack>

            {draft && <EventEditorModal draft={draft}
                                        onClose={() => setDraft(null)}
                                        onSaved={() => { setDraft(null); loadEvents(); }}/>}
        </Box>
    );
}

interface EditorProps {
    draft: Draft;
    onClose: () => void;
    onSaved: () => void;
}

function EventEditorModal({draft: initialDraft, onClose, onSaved}: EditorProps) {
    const [draft, setDraft] = useState<Draft>(initialDraft);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const allItemsApi = useApi(itemsApi.getSuggestedItems);

    useEffect(() => {
        allItemsApi.request();
    }, []);

    const allItems: Item[] = useMemo(() => Object.values(allItemsApi.data ?? {}).flat(), [allItemsApi.data]);
    const itemOptions = allItems
        .filter((item) => !draft.items.some((d) => d.item.id === item.id))
        .map((item) => ({value: `${item.id}`, label: item.description}));

    const updateItem = (index: number, change: Partial<DraftItem>) =>
        setDraft({...draft, items: draft.items.map((d, i) => i === index ? {...d, ...change} : d)});

    const moveItem = (index: number, by: number) => {
        const items = [...draft.items];
        const [moved] = items.splice(index, 1);
        items.splice(index + by, 0, moved);
        setDraft({...draft, items});
    };

    const save = () => {
        const request: SpecialEventRequest = {
            name: draft.name.trim(),
            eventDate: draft.eventDate,
            itemsPerGuest: draft.itemsPerGuest,
            items: draft.items.map((d) => ({itemId: d.item.id, quantityAvailable: d.quantityAvailable})),
        };
        setSaving(true);
        setError('');
        (draft.uuid ? specialEventsApi.updateEvent(draft.uuid, request) : specialEventsApi.createEvent(request))
            .then(onSaved)
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setSaving(false));
    };

    return (
        <Modal opened onClose={onClose} size="lg" title={draft.uuid ? 'Edit event' : 'New event'}>
            <Stack>
                <TextInput label="Name" placeholder="Christmas Giveaway 2026" required
                           value={draft.name} onChange={(e) => setDraft({...draft, name: e.currentTarget.value})}/>
                <Group grow align="start">
                    <DateInput label="Date" description="For reference only" clearable
                               value={draft.eventDate} onChange={(value) => setDraft({...draft, eventDate: value})}/>
                    <NumberInput label="Items per guest" description="How many different items a guest can pick"
                                 min={1} allowDecimal={false} value={draft.itemsPerGuest}
                                 onChange={(value) => setDraft({...draft, itemsPerGuest: Math.max(1, Number(value) || 1)})}/>
                </Group>

                <Text fw={600} mt="sm">Items</Text>
                <Text size="xs" c="dimmed" mt={-12}>
                    Leave stock empty for no limit. For items with sizes or other options, leave stock empty and mark the
                    item unavailable on the Items page when it runs out.
                </Text>
                {draft.items.map((d, index) => (
                    <Group key={d.item.id} wrap="nowrap" align="end">
                        <Stack gap={0} style={{flex: 1}}>
                            <Text>{d.item.description}</Text>
                            {d.item.attributes?.length > 0 &&
                                <Text size="xs" c="orange.8">Has options, which can't be picked on the event page</Text>}
                        </Stack>
                        <NumberInput placeholder="No limit" w={120} min={0} allowDecimal={false}
                                     aria-label={`Stock for ${d.item.description}`}
                                     value={d.quantityAvailable ?? ''}
                                     onChange={(value) => updateItem(index, {
                                         quantityAvailable: value === '' ? null : Math.max(0, Number(value))
                                     })}/>
                        <ActionIcon variant="subtle" disabled={index === 0} onClick={() => moveItem(index, -1)} aria-label="Move up">
                            <IconArrowUp size={16}/>
                        </ActionIcon>
                        <ActionIcon variant="subtle" disabled={index === draft.items.length - 1} onClick={() => moveItem(index, 1)} aria-label="Move down">
                            <IconArrowDown size={16}/>
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" aria-label="Remove item"
                                    onClick={() => setDraft({...draft, items: draft.items.filter((_, i) => i !== index)})}>
                            <IconTrash size={16}/>
                        </ActionIcon>
                    </Group>
                ))}
                <Select placeholder={allItemsApi.loading ? 'Loading items…' : 'Add an item'} searchable
                        data={itemOptions} value={null}
                        onChange={(value) => {
                            const item = allItems.find((i) => `${i.id}` === value);
                            if (item) setDraft({...draft, items: [...draft.items, {item, quantityAvailable: null}]});
                        }}/>

                {error && <Alert color="red" icon={<IconAlertTriangle/>}>{error}</Alert>}
                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose}>Cancel</Button>
                    <Button loading={saving} disabled={!draft.name.trim()} onClick={save}>Save</Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export default SpecialEventsPage;
