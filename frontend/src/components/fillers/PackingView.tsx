import {
    Anchor,
    Button, 
    Group, 
    Text, 
    Box, 
    Loader, 
    Stack,
    Card,
    ActionIcon,
    useMantineTheme,
    Progress
} from '@mantine/core';
import {
    IconSquare,
    IconCheckbox,
    IconCloudCheck,
    IconAlertTriangle
} from '@tabler/icons-react';
import {CreateItemLimitEntryResponse, OrderDetails, OrderItem, OrderStatus} from 'src/models/types.tsx';
import { useSelectedOrder } from 'src/context/SelectedOrderContext.tsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import useApi from 'src/hooks/useApi.tsx';
import ordersApi from 'src/services/ordersApi.tsx';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from 'src/context/FeaturesContext.tsx';
import {useAuth0} from "@auth0/auth0-react";
import {useOrderFulfillmentTracking} from "src/hooks/useOrderFulfillmentTracking.tsx";
import GroupedAttributeBadges from 'src/components/common/items/GroupedAttributeBadges';
import ItemLimitInfo from "src/components/common/items/ItemLimitInfo.tsx";
import RecordPickupModal from "src/components/customer/RecordPickupModal.tsx";
import PlaceInWagonModal from './PlaceInWagonModal';

// 'pending' = edited locally, waiting for the debounced save to start
type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
type QuantityMap = Record<number, number>;

const AUTO_SAVE_DELAY_MS = 1000;

const toQuantityMap = (items: OrderItem[]): QuantityMap =>
    items.reduce((acc, item) => {
        acc[item.id] = item.quantityFulfilled;
        return acc;
    }, {} as QuantityMap);

const isDirty = (items: OrderItem[], saved: QuantityMap): boolean =>
    items.some((item) => item.quantityFulfilled !== (saved[item.id] ?? 0));

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
    // Nothing is shown while edits wait for the debounce ('pending'), so it never claims "Saved" for unsaved changes
    if (state === 'saving') {
        return <Group gap={4}><Loader size={12}/><Text size="xs" c="dimmed">Saving…</Text></Group>;
    }
    if (state === 'saved') {
        return <Group gap={4}><IconCloudCheck size={14} color="gray"/><Text size="xs" c="dimmed">Saved</Text></Group>;
    }
    if (state === 'error') {
        return (
            <Group gap={4}>
                <IconAlertTriangle size={14} color="red"/>
                <Text size="xs" c="red">Not saved</Text>
                <Anchor component="button" type="button" size="xs" onClick={onRetry}>Retry</Anchor>
            </Group>
        );
    }
    return null;
}

function PackingView() {
    const { selectedOrder } = useSelectedOrder();
    const updateStatus = useApi(ordersApi.updateOrderStatus);
    const printLabel = useApi(ordersApi.print);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const [placeInWagonModalOpened, setPlaceInWagonModalOpened] = useState(false);
    // Item id of the limited line the filler is recording an earlier pickup for
    const [recordPickupItemId, setRecordPickupItemId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { printOnTransitionToStatus } = useFeatures();
    const { user } = useAuth0();
    const { startFilling, completeFilling } = useOrderFulfillmentTracking();
    const theme = useMantineTheme();

    useEffect(() => {
        if (updateStatus.data?.orderStatus === OrderStatus.PACKED) {
            navigate('/dashboard/filler');
            completeFilling("packed");
        }
    }, [updateStatus.data]);

    // Auto-save state. Refs hold the latest values so debounced/unmount saves never act on stale closures.
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const draftRef = useRef<OrderItem[]>([]);
    const lastSavedRef = useRef<QuantityMap>({});
    const loadedOrderUuidRef = useRef<string | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inFlightRef = useRef<Promise<boolean> | null>(null);

    useEffect(() => {
        if (!selectedOrder) return;
        const serverItems = selectedOrder.items.map((item) => ({
            ...item,
            quantityFulfilled: item.quantityFulfilled || 0,
        }));

        if (loadedOrderUuidRef.current !== selectedOrder.uuid) {
            // Newly opened order: don't drop unsaved progress from the previous one, then take the server state as-is
            const previousUuid = loadedOrderUuidRef.current;
            if (previousUuid && isDirty(draftRef.current, lastSavedRef.current)) {
                if (saveTimerRef.current) {
                    clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = null;
                }
                void ordersApi.updateOrderItems({orderUuid: previousUuid, quantities: toQuantityMap(draftRef.current)});
            }
            loadedOrderUuidRef.current = selectedOrder.uuid;
            draftRef.current = serverItems;
            startFilling(`${selectedOrder.id!}`);
            lastSavedRef.current = toQuantityMap(serverItems);
            setSaveState('idle');
            setDraftItems(serverItems);
            return;
        }

        // Same order refreshed (e.g. assignee change). Keep packing progress that hasn't reached the server yet.
        const hasPendingLocal = isDirty(draftRef.current, lastSavedRef.current) || inFlightRef.current !== null;
        if (!hasPendingLocal) {
            lastSavedRef.current = toQuantityMap(serverItems);
        }
        const localQuantities = toQuantityMap(draftRef.current);
        setDraftItems(serverItems.map((item) =>
            hasPendingLocal && localQuantities[item.id] !== undefined
                ? {...item, quantityFulfilled: localQuantities[item.id]}
                : item));
    }, [selectedOrder]);

    useEffect(() => {
        draftRef.current = draftItems;
    }, [draftItems]);

    // Sends the latest draft if it differs from what the server has. Saves are serialized so they can't land out of order.
    const flushSave = useCallback(async (): Promise<boolean> => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        while (inFlightRef.current) {
            await inFlightRef.current;
        }
        // Loop because more changes may be made while a save is in flight
        let orderUuid = loadedOrderUuidRef.current;
        while (orderUuid && isDirty(draftRef.current, lastSavedRef.current)) {
            const quantities = toQuantityMap(draftRef.current);
            setSaveState('saving');
            const savePromise = ordersApi.updateOrderItems({orderUuid, quantities})
                .then(() => {
                    // Ignore if the filler has already moved on to a different order
                    if (loadedOrderUuidRef.current === orderUuid) lastSavedRef.current = quantities;
                    return true;
                })
                .catch(() => false);
            inFlightRef.current = savePromise;
            const ok = await savePromise;
            inFlightRef.current = null;

            if (!ok) {
                setSaveState('error');
                return false;
            }
            if (loadedOrderUuidRef.current !== orderUuid) return true;
            orderUuid = loadedOrderUuidRef.current;
            if (!isDirty(draftRef.current, lastSavedRef.current)) {
                setSaveState('saved');
            }
        }
        // Edits that ended up back where the server already is (e.g. toggled twice) need no request
        setSaveState((prev) => (prev === 'pending' ? 'saved' : prev));
        return true;
    }, []);

    // Debounced auto-save whenever packing progress changes
    useEffect(() => {
        if (!loadedOrderUuidRef.current) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveTimerRef.current = null;
            void flushSave();
        }, AUTO_SAVE_DELAY_MS);
    }, [draftItems, flushSave]);

    // Save immediately when leaving the view (back button, closing the modal, opening another order)
    useEffect(() => {
        const flushOnHide = () => {
            if (document.visibilityState === 'hidden') void flushSave();
        };
        document.addEventListener('visibilitychange', flushOnHide);
        window.addEventListener('pagehide', flushOnHide);
        return () => {
            document.removeEventListener('visibilitychange', flushOnHide);
            window.removeEventListener('pagehide', flushOnHide);
            void flushSave();
        };
    }, [flushSave]);

    // Show the re-checked limits without reloading the order, which would drop unsaved packing progress
    const handlePickupRecorded = (response: CreateItemLimitEntryResponse) => {
        setDraftItems((prev) => prev.map((item) =>
            response.orderItemSnapshots[item.id] ? {...item, limitSnapshot: response.orderItemSnapshots[item.id]} : item));
    };

    // Every packing edit goes through here so the status stops showing "Saved" as soon as something changes
    const editDraft = (update: (prev: OrderItem[]) => OrderItem[]) => {
        setSaveState('pending');
        setDraftItems(update);
    };

    const updateDraftItemQuantityFulfilled = (id: number, newQuantityFulfilled: number) => {
        editDraft((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantityFulfilled: newQuantityFulfilled } : item
            )
        );
    };

    const clearAll = () => {
        editDraft((prev) => prev.map((item) => ({ ...item, quantityFulfilled: 0 })));
    };

    const fillAll = () => {
        editDraft((prev) => prev.map((item) => ({ ...item, quantityFulfilled: item.quantityRequested })));
    };

    const handlePlaceInWagonClick = async () => {
        // Make sure the server has the latest packing progress before confirming
        const saved = await flushSave();
        if (!saved) return;

        if (printOnTransitionToStatus !== null) {
            // If printing is enabled, always show modal
            setPlaceInWagonModalOpened(true);
        } else if (unfilledItems.length > 0) {
            // If no printing and unfilled items, show modal
            setPlaceInWagonModalOpened(true);
        } else {
            // No printing and all items filled, go directly to wagon
            updateStatus.request(selectedOrder!.uuid, OrderStatus.PACKED);
        }
    };

    const confirmPlaceInWagon = () => {
        updateStatus.request(selectedOrder!.uuid, OrderStatus.PACKED);
        setPlaceInWagonModalOpened(false);
    };

    const handlePrintLabel = () => {
        printLabel.request(selectedOrder!.uuid, OrderStatus.PACKED);
    };

    if (!selectedOrder) return <Loader />;
    
    const assignedToMe = (selectedOrder as OrderDetails)?.assignee?.externalId === user?.sub;

    // Toggle pack/unpack for items
    const togglePack = (itemId: number) => {
        const item = draftItems.find(i => i.id === itemId);
        if (!item) return;
        
        const newQuantity = item.quantityFulfilled > 0 ? 0 : item.quantityRequested;
        updateDraftItemQuantityFulfilled(itemId, newQuantity);
    };

    // Calculate progress
    const totalItems = draftItems.length;
    const completedItems = draftItems.filter(item => item.quantityFulfilled === item.quantityRequested).length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    // Calculate unfilled items for modal
    const unfilledItems = draftItems.filter(item => item.quantityFulfilled < item.quantityRequested);

    return (
        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <RecordPickupModal
                customerUuid={selectedOrder.customer.uuid}
                opened={recordPickupItemId !== null}
                onClose={() => setRecordPickupItemId(null)}
                onSaved={handlePickupRecorded}
                itemId={recordPickupItemId ?? undefined}
                orderUuid={selectedOrder.uuid}
            />
            {/* Items List - Streamlined for speed */}
            <Box style={{ flex: 1, overflow: 'auto' }}>
                <Stack gap="xs">
                    {draftItems.map((item) => {
                        const isComplete = item.quantityFulfilled === item.quantityRequested;
                        
                        return (
                            <Card 
                                key={item.id} 
                                p="xs"
                                radius="md" 
                                withBorder
                                bg={isComplete ? 'green.0' : undefined}
                                style={{ 
                                    borderColor: isComplete ? theme.colors.green[3] : undefined,
                                    borderWidth: isComplete ? 2 : undefined
                                }}
                            >
                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                    <Box style={{ flex: 1 }}>
                                        {/* Item description */}
                                        <Group gap="xs" mb="xs">
                                            <Text fw={600} size="sm">
                                                {item.description}
                                            </Text>
                                        </Group>
                                        
                                        {/* Attributes and notes */}
                                        {(Object.keys(item.attributes).length > 0) && (
                                            <Group gap="xs" mb="xs">
                                                {Object.keys(item.attributes).length > 0 && (
                                                    <GroupedAttributeBadges 
                                                    attrs={item.attributes} 
                                                    itemAttributes={item.item.attributes}
                                                />
                                                )}
                                            </Group>
                                        )}

                                        {item.notes && (
                                            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                Note: {item.notes}
                                            </Text>
                                        )}

                                        {item.limitSnapshot && (
                                            <Box mt="xs">
                                                <ItemLimitInfo snapshot rule={item.limitSnapshot.rule} status={item.limitSnapshot}/>
                                                <Anchor component="button" type="button" size="xs"
                                                        onClick={() => setRecordPickupItemId(item.item.id)}>
                                                    Record earlier pickup
                                                </Anchor>
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {/* Toggle pack/unpack button */}
                                    {assignedToMe && (
                                        <ActionIcon
                                            size="lg"
                                            color={isComplete ? 'green' : 'gray'}
                                            variant={ isComplete ? "light" : 'outline' }
                                            onClick={() => togglePack(item.id)}
                                        >
                                            {isComplete ? <IconCheckbox size={18} /> : <IconSquare size={18} />}
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Card>
                        );
                    })}
                </Stack>
            </Box>

            {/* Progress and controls */}
            <Box 
                style={{ 
                    flexShrink: 0,
                    borderTop: `1px solid ${theme.colors.gray[3]}`,
                    paddingTop: 16,
                    marginTop: 16
                }}
            >
                {/* Progress bar */}
                <Box mb="md">
                    <Group justify="space-between" mb="xs">
                        <Group gap={6}>
                            <Text size="sm" fw={500}>Packing Progress</Text>
                            <SaveStatus state={saveState} onRetry={() => void flushSave()}/>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {completedItems}/{totalItems} items ({progressPercentage}%)
                        </Text>
                    </Group>
                    <Progress 
                        value={progressPercentage} 
                        color={progressPercentage === 100 ? 'green' : 'blue'}
                        size="lg" 
                        radius="md"
                    />
                </Box>

                {/* Control buttons */}
                <Group justify="flex-start" gap="xs">
                    <Button 
                        variant="light"
                        disabled={!assignedToMe}
                        onClick={clearAll}
                        size="sm"
                        p={'xs'}
                    >
                        Clear All
                    </Button>
                    <Button 
                        variant="light"
                        disabled={!assignedToMe}
                        onClick={fillAll}
                        size="sm"
                        p={'xs'}
                    >
                        Pack All
                    </Button>
                    
                    <Button
                        disabled={!assignedToMe}
                        loading={saveState === 'saving' || updateStatus.loading}
                        onClick={handlePlaceInWagonClick}
                        color="green"
                        p={'xs'}
                        size="sm"
                        style={{ marginLeft: 'auto' }}
                    >
                        Done Packing
                    </Button>
                </Group>
            </Box>

            <PlaceInWagonModal
                opened={placeInWagonModalOpened}
                onClose={() => setPlaceInWagonModalOpened(false)}
                onConfirm={confirmPlaceInWagon}
                unfilledItems={unfilledItems}
                loading={updateStatus.loading}
                onPrintLabel={handlePrintLabel}
                printLabelLoading={printLabel.loading}
                printingEnabled={printOnTransitionToStatus !== null}
            />
        </Box>
    );
}

export default PackingView;
