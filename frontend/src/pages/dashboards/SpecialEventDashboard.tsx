import {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    UnstyledButton
} from "@mantine/core";
import {modals} from "@mantine/modals";
import {IconAlertTriangle, IconCheck, IconCircleCheckFilled, IconGift, IconUser} from "@tabler/icons-react";
import {useSubscription} from "react-stomp-hooks";
import {Link} from "react-router-dom";
import useApi from "src/hooks/useApi.tsx";
import specialEventsApi from "src/services/specialEventsApi.tsx";
import customersApi from "src/services/customersApi.tsx";
import {useFeatures} from "src/context/FeaturesContext.tsx";
import CustomerSearch from "src/components/customer/CustomerSearch.tsx";
import ItemLimitInfo from "src/components/common/items/ItemLimitInfo.tsx";
import {
    CustomerSearchResult,
    ItemLimitStatus,
    SpecialEvent,
    SpecialEventCustomerOrder,
    SpecialEventItem,
    SpecialEventOrderRequest
} from "src/models/types.tsx";
import {statusDisplay} from "src/utils/StatusUtils.tsx";
import {usePullToRefreshDisabled} from "src/hooks/usePullToRefreshDisabled.tsx";

/** How long the confirmation stays up before the page resets for the next guest */
const CONFIRMATION_MS = 2500;

interface Guest {
    /** Empty for a guest being added */
    uuid: string;
    firstName: string;
    lastName: string;
    obfuscateName: boolean;
}

interface Confirmation {
    guestName: string;
    items: string[];
    orderId: number;
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const isOut = (eventItem: SpecialEventItem): boolean =>
    eventItem.remaining === 0 || eventItem.item.availability !== 'AVAILABLE';

export function SpecialEventDashboard() {
    usePullToRefreshDisabled();

    const {activeSpecialEvent, featuresLoaded} = useFeatures();
    const activeEventApi = useApi(specialEventsApi.getActiveEvent);
    const customerOrdersApi = useApi(specialEventsApi.getCustomerOrders);
    const itemLimitsApi = useApi(customersApi.getItemLimits);

    const [event, setEvent] = useState<SpecialEvent | null>(null);
    const [eventLoaded, setEventLoaded] = useState(false);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [addingGuest, setAddingGuest] = useState<Guest | null>(null);
    const [pickedItemIds, setPickedItemIds] = useState<number[]>([]);
    const [existingOrders, setExistingOrders] = useState<SpecialEventCustomerOrder[]>([]);
    const [limitStatuses, setLimitStatuses] = useState<Record<number, ItemLimitStatus>>({});
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const [submitError, setSubmitError] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const refreshEvent = useCallback(() => {
        activeEventApi.request({silent: true}).then((result) => {
            // An empty body means no event is running
            setEvent(result?.data ? result.data : null);
            setEventLoaded(true);
        });
    }, [activeEventApi.request]);

    useEffect(() => {
        if (featuresLoaded) {
            refreshEvent();
        }
    }, [featuresLoaded, activeSpecialEvent?.uuid, activeSpecialEvent?.name]);

    // Keep stock counts live as other order takers submit, and as orders are cancelled
    useSubscription(["/topic/orders/created", "/topic/orders/status", "/topic/orders/status/bulk"], () => {
        refreshEvent();
    });

    // Picks that ran out since they were tapped drop off
    const selectedItemIds = useMemo(() => pickedItemIds.filter((itemId) => {
        const eventItem = event?.items.find((i) => i.item.id === itemId);
        return !!eventItem && !isOut(eventItem);
    }), [pickedItemIds, event]);

    const chooseGuest = (newGuest: Guest | null) => {
        setGuest(newGuest);
        setExistingOrders([]);
        setLimitStatuses({});
    };

    // A returning guest: check for an earlier order at this event and their item limits
    useEffect(() => {
        if (!guest?.uuid || !event) return;

        let cancelled = false;
        customerOrdersApi.request(event.uuid, guest.uuid, {silent: true}).then((result) => {
            if (!cancelled && result) setExistingOrders(result.data);
        });
        itemLimitsApi.request(guest.uuid, {silent: true}).then((result) => {
            if (!cancelled && result) {
                setLimitStatuses(Object.fromEntries(result.data.map((limit) => [limit.itemId, limit.status])));
            }
        });
        return () => { cancelled = true; };
    }, [guest?.uuid, event?.uuid]);

    // Clear the confirmation after a moment so the next guest can be helped
    useEffect(() => {
        if (!confirmation) return;
        const timeout = setTimeout(() => setConfirmation(null), CONFIRMATION_MS);
        return () => clearTimeout(timeout);
    }, [confirmation]);

    const guestName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : '';

    const selectedDescriptions = useMemo(() => selectedItemIds
        .map((itemId) => event?.items.find((i) => i.item.id === itemId)?.item.description ?? '')
        .map(capitalize), [selectedItemIds, event]);

    const resetForNextGuest = () => {
        chooseGuest(null);
        setAddingGuest(null);
        setPickedItemIds([]);
        setSubmitError('');
    };

    const toggleItem = (eventItem: SpecialEventItem) => {
        if (!event || isOut(eventItem)) return;
        const itemId = eventItem.item.id;
        setSubmitError('');
        const current = selectedItemIds;
        if (current.includes(itemId)) {
            setPickedItemIds(current.filter((id) => id !== itemId));
        } else if (event.itemsPerGuest === 1) {
            // One pick per guest: tapping another item switches to it
            setPickedItemIds([itemId]);
        } else if (current.length < event.itemsPerGuest) {
            setPickedItemIds([...current, itemId]);
        }
    };

    const submit = (allowAdditional: boolean) => {
        if (!event || !guest || selectedItemIds.length === 0) return;
        const request: SpecialEventOrderRequest = guest.uuid
            ? {customerUuid: guest.uuid, itemIds: selectedItemIds, allowAdditional}
            : {
                customerFirstName: guest.firstName.trim(),
                customerLastName: guest.lastName.trim(),
                customerNameObfuscated: guest.obfuscateName,
                itemIds: selectedItemIds,
                allowAdditional,
            };
        setSubmitError('');
        setSubmitting(true);
        specialEventsApi.createOrder(event.uuid, request)
            .then((result) => {
                setConfirmation({guestName, items: selectedDescriptions, orderId: result.data.id});
                resetForNextGuest();
            })
            .catch((err: { response?: { data?: { message?: string } } }) => {
                setSubmitError(err?.response?.data?.message || 'The order could not be submitted. Try again.');
            })
            .finally(() => {
                setSubmitting(false);
                refreshEvent();
            });
    };

    const handleSubmit = () => {
        if (existingOrders.length === 0) {
            submit(false);
            return;
        }
        modals.openConfirmModal({
            title: `${guest?.firstName} already has an order`,
            children: <Text size="sm">
                {existingOrders.map((o) => `${o.items.map(capitalize).join(', ')} (order #${o.id})`).join('; ')}.
                Give them another?
            </Text>,
            labels: {confirm: 'Yes, give another', cancel: 'Cancel'},
            confirmProps: {color: 'orange'},
            onConfirm: () => submit(true),
        });
    };

    if (!eventLoaded) {
        return <Center h={200}><Loader/></Center>;
    }

    if (!event) {
        return (
            <Box p="md">
                <Alert color="gray" title="No special event is running">
                    An admin can start one from the Special Events page. Regular orders are taken on
                    the <Link to="/dashboard/taker">Order Taker</Link> page.
                </Alert>
            </Box>
        );
    }

    if (confirmation) {
        return (
            <Center h="100%" p="md" onClick={() => setConfirmation(null)} style={{cursor: 'pointer'}}>
                <Stack align="center" gap="sm">
                    <ThemeIcon size={80} radius="xl" color="green"><IconCheck size={56}/></ThemeIcon>
                    <Title order={2} ta="center">{confirmation.guestName}: {confirmation.items.join(', ')}</Title>
                    <Text c="dimmed">Order #{confirmation.orderId} is ready for pickup</Text>
                    <Button variant="light" mt="md" onClick={() => setConfirmation(null)}>Next guest</Button>
                </Stack>
            </Center>
        );
    }

    return (
        <Box p="md" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Group gap="xs" mb="md">
                <IconGift color="var(--mantine-color-red-7)"/>
                <Title order={3}>{event.name}</Title>
            </Group>

            <Box style={{flex: 1, overflow: 'auto'}}>
                {!guest && !addingGuest && (
                    <CustomerSearch
                        onSelect={(customer: CustomerSearchResult) => chooseGuest({
                            uuid: customer.uuid,
                            firstName: customer.firstName,
                            lastName: customer.lastName || '',
                            obfuscateName: false,
                        })}
                        onSelectCreate={(first: string, last: string) =>
                            setAddingGuest({uuid: '', firstName: first, lastName: last, obfuscateName: false})}
                    />
                )}

                {!guest && addingGuest && (
                    <Stack>
                        <TextInput label="First Name" size="lg" value={addingGuest.firstName}
                                   onChange={(e) => setAddingGuest({...addingGuest, firstName: e.currentTarget.value})}/>
                        <TextInput label="Last Name" size="lg" value={addingGuest.lastName}
                                   onChange={(e) => setAddingGuest({...addingGuest, lastName: e.currentTarget.value})}/>
                        <Switch label="Keep name hidden" size="lg" checked={addingGuest.obfuscateName}
                                onChange={(e) => setAddingGuest({...addingGuest, obfuscateName: e.currentTarget.checked})}/>
                        <Group grow>
                            <Button variant="outline" onClick={() => setAddingGuest(null)}>Back to Search</Button>
                            <Button disabled={!addingGuest.firstName.trim() || !addingGuest.lastName.trim()}
                                    onClick={() => { chooseGuest(addingGuest); setAddingGuest(null); }}>
                                Next
                            </Button>
                        </Group>
                    </Stack>
                )}

                {guest && (
                    <Stack>
                        <Group justify="space-between">
                            <Group gap="xs">
                                <IconUser size={20}/>
                                <Text fw={600} size="lg">{guestName}</Text>
                                {!guest.uuid && <Badge variant="light">New guest</Badge>}
                            </Group>
                            <Button variant="subtle" size="xs" onClick={resetForNextGuest}>Change guest</Button>
                        </Group>

                        {existingOrders.length > 0 && (
                            <Alert color="orange" icon={<IconAlertTriangle/>}
                                   title={`${guest.firstName} already has an order for ${event.name}`}>
                                {existingOrders.map((o) => (
                                    <Text size="sm" key={o.uuid}>
                                        {o.items.map(capitalize).join(', ')}: order #{o.id}, {statusDisplay(o.orderStatus)}
                                    </Text>
                                ))}
                            </Alert>
                        )}

                        <Text c="dimmed" size="sm">
                            {event.itemsPerGuest === 1 ? 'Pick one item' : `Pick up to ${event.itemsPerGuest} items`}
                        </Text>

                        <SimpleGrid cols={{base: 1, xs: 2, md: 3}}>
                            {event.items.map((eventItem) => (
                                <EventItemCard key={eventItem.item.id}
                                               eventItem={eventItem}
                                               selected={selectedItemIds.includes(eventItem.item.id)}
                                               limitStatus={limitStatuses[eventItem.item.id]}
                                               onClick={() => toggleItem(eventItem)}/>
                            ))}
                        </SimpleGrid>

                        {submitError && <Alert color="red" icon={<IconAlertTriangle/>}>{submitError}</Alert>}
                    </Stack>
                )}
            </Box>

            {guest && (
                <Box pt="md" style={{flexShrink: 0, borderTop: '1px solid var(--mantine-color-gray-2)'}}>
                    <Button fullWidth size="lg"
                            disabled={selectedItemIds.length === 0}
                            loading={submitting}
                            onClick={handleSubmit}>
                        {selectedItemIds.length === 0 ? 'Pick an item' : `Submit: ${selectedDescriptions.join(', ')}`}
                    </Button>
                </Box>
            )}
        </Box>
    );
}

interface EventItemCardProps {
    eventItem: SpecialEventItem;
    selected: boolean;
    limitStatus?: ItemLimitStatus;
    onClick: () => void;
}

function EventItemCard({eventItem, selected, limitStatus, onClick}: EventItemCardProps) {
    const out = isOut(eventItem);
    const unavailable = eventItem.item.availability !== 'AVAILABLE';

    return (
        <UnstyledButton onClick={onClick} disabled={out} style={{cursor: out ? 'not-allowed' : 'pointer'}}>
            <Card withBorder padding="lg" radius="md"
                  style={{
                      opacity: out ? 0.45 : 1,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
                      backgroundColor: selected ? 'var(--mantine-color-blue-0)' : undefined,
                      minHeight: 120,
                  }}>
                <Stack gap="xs">
                    <Group justify="space-between" wrap="nowrap">
                        <Text fw={700} size="xl">{capitalize(eventItem.item.description)}</Text>
                        {selected && <IconCircleCheckFilled color="var(--mantine-color-blue-6)" size={28}/>}
                    </Group>
                    <Group gap="xs">
                        {unavailable
                            ? <Badge color="gray" variant="filled">Unavailable</Badge>
                            : eventItem.remaining === 0
                                ? <Badge color="gray" variant="filled">Out</Badge>
                                : eventItem.remaining !== null &&
                                <Badge color={eventItem.remaining <= 5 ? 'orange' : 'green'} variant="light" size="lg">
                                    {eventItem.remaining} left
                                </Badge>}
                    </Group>
                    {eventItem.item.limit && (
                        <ItemLimitInfo compact rule={eventItem.item.limit} status={limitStatus}/>
                    )}
                </Stack>
            </Card>
        </UnstyledButton>
    );
}

export default SpecialEventDashboard;
