import {
    Button,
    Group,
    Text,
    Box,
    Loader,
    Stack,
    Card,
    ActionIcon,
    useMantineTheme,
    Progress,
    Badge,
    Collapse,
    Textarea,
    CloseButton,
} from '@mantine/core';
import {
    IconSquare,
    IconCheckbox,
    IconArrowsExchange,
    IconTrash,
} from '@tabler/icons-react';
import { CreateSubstitutionRequest, Item, OrderDetails, OrderItem, OrderItemSubstitution, OrderStatus } from 'src/models/types.tsx';
import { useSelectedOrder } from 'src/context/SelectedOrderContext.tsx';
import { useEffect, useState } from 'react';
import useApi from 'src/hooks/useApi.tsx';
import ordersApi from 'src/services/ordersApi.tsx';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from 'src/context/FeaturesContext.tsx';
import {useAuth0} from "@auth0/auth0-react";
import {useOrderFulfillmentTracking} from "src/hooks/useOrderFulfillmentTracking.tsx";
import GroupedAttributeBadges from 'src/components/common/items/GroupedAttributeBadges';
import PlaceInWagonModal from './PlaceInWagonModal';
import { ItemSearch } from 'src/components/common/ItemSearch';

interface SubstitutionFormState {
    orderItemId: number;
    selectedItem: Item | null;
    note: string;
}

function PackingView() {
    const { selectedOrder, doForceRefresh } = useSelectedOrder();
    const updateQuantities = useApi(ordersApi.updateOrderItems);
    const updateStatus = useApi(ordersApi.updateOrderStatus);
    const printLabel = useApi(ordersApi.print);
    const addSubstitutionApi = useApi(ordersApi.addSubstitution);
    const removeSubstitutionApi = useApi(ordersApi.removeSubstitution);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const [placeInWagonModalOpened, setPlaceInWagonModalOpened] = useState(false);
    const [substitutionForm, setSubstitutionForm] = useState<SubstitutionFormState | null>(null);
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

    useEffect(() => {
        if (updateQuantities.data) {
            doForceRefresh();
        }
    }, [updateQuantities.data]);

    useEffect(() => {
        if (addSubstitutionApi.data) {
            doForceRefresh();
            setSubstitutionForm(null);
        }
    }, [addSubstitutionApi.data]);

    useEffect(() => {
        if (removeSubstitutionApi.data !== undefined) {
            doForceRefresh();
        }
    }, [removeSubstitutionApi.data]);

    useEffect(() => {
        if (!selectedOrder) return;
        startFilling(`${selectedOrder!.id!}`)
        setDraftItems(
            selectedOrder.items.map((item) => ({
                ...item,
                quantityFulfilled: item.quantityFulfilled || 0,
            }))
        );
    }, [selectedOrder]);

    const updateDraftItemQuantityFulfilled = (id: number, newQuantityFulfilled: number) => {
        setDraftItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantityFulfilled: newQuantityFulfilled } : item
            )
        );
    };

    const clearAll = () => {
        setDraftItems((prev) => prev.map((item) => ({ ...item, quantityFulfilled: 0 })));
    };

    const fillAll = () => {
        setDraftItems((prev) => prev.map((item) => ({ ...item, quantityFulfilled: item.quantityRequested })));
    };

    const saveProgress = () => {
        const quantities = draftItems.reduce((acc, item) => {
            acc[item.id] = item.quantityFulfilled;
            return acc;
        }, {} as Record<number, number>);

        return updateQuantities.request({
            orderUuid: selectedOrder?.uuid,
            quantities,
        });
    };

    const handlePlaceInWagonClick = () => {
        if (printOnTransitionToStatus !== null) {
            setPlaceInWagonModalOpened(true);
        } else if (unhandledItems.length > 0) {
            setPlaceInWagonModalOpened(true);
        } else {
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

    const openSubstitutionForm = (orderItemId: number) => {
        const item = draftItems.find(i => i.id === orderItemId);
        if (!item) return;
        setSubstitutionForm({
            orderItemId,
            selectedItem: null,
            note: '',
        });
    };

    const submitSubstitution = () => {
        if (!substitutionForm?.selectedItem) return;
        const req: CreateSubstitutionRequest = {
            itemId: substitutionForm.selectedItem.id,
            quantity: 1,
            note: substitutionForm.note || undefined,
        };
        addSubstitutionApi.request(substitutionForm.orderItemId, req);
    };

    const handleRemoveSubstitution = (orderItemId: number, substitutionUuid: string) => {
        removeSubstitutionApi.request(orderItemId, substitutionUuid);
    };

    const hasStateChanged = draftItems.some(
        (draftItem) => draftItem.quantityFulfilled !== selectedOrder?.items.find((item) => item.id === draftItem.id)?.quantityFulfilled
    );

    if (!selectedOrder) return <Loader />;

    const assignedToMe = (selectedOrder as OrderDetails)?.assignee?.externalId === user?.sub;

    const togglePack = (itemId: number) => {
        const item = draftItems.find(i => i.id === itemId);
        if (!item) return;
        const newQuantity = item.quantityFulfilled > 0 ? 0 : item.quantityRequested;
        updateDraftItemQuantityFulfilled(itemId, newQuantity);
    };

    const getSubTotal = (itemId: number): number => {
        return selectedOrder.items.find(i => i.id === itemId)?.substitutions?.reduce((s, sub) => s + sub.quantity, 0) ?? 0;
    };

    const totalItems = draftItems.length;
    const completedItems = draftItems.filter(item =>
        item.quantityFulfilled + getSubTotal(item.id) >= item.quantityRequested
    ).length;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const unhandledItems = draftItems.filter(item =>
        item.quantityFulfilled + getSubTotal(item.id) < item.quantityRequested
    );

    return (
        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box style={{ flex: 1, overflow: 'auto' }}>
                <Stack gap="xs">
                    {draftItems.map((item) => {
                        const serverSubs: OrderItemSubstitution[] = selectedOrder.items.find(i => i.id === item.id)?.substitutions ?? [];
                        const subTotal = serverSubs.reduce((s, sub) => s + sub.quantity, 0);
                        const totalHandled = item.quantityFulfilled + subTotal;
                        const isComplete = totalHandled >= item.quantityRequested;
                        const isSubstituted = serverSubs.length > 0;
                        const showSubForm = substitutionForm?.orderItemId === item.id;

                        return (
                            <Card
                                key={item.id}
                                p="xs"
                                radius="md"
                                withBorder
                                bg={isComplete ? (isSubstituted ? 'yellow.0' : 'green.0') : undefined}
                                style={{
                                    borderColor: isComplete
                                        ? (isSubstituted ? theme.colors.yellow[4] : theme.colors.green[3])
                                        : undefined,
                                    borderWidth: isComplete ? 2 : undefined
                                }}
                            >
                                <Group justify="space-between" align="flex-start" wrap="nowrap">
                                    <Box style={{ flex: 1 }}>
                                        <Group gap="xs" mb="xs">
                                            <Text fw={600} size="sm">
                                                {item.description}
                                            </Text>
                                            {isSubstituted && (
                                                <Badge color="yellow" size="xs" variant="filled">SUB</Badge>
                                            )}
                                        </Group>

                                        {(Object.keys(item.attributes).length > 0) && (
                                            <Group gap="xs" mb="xs">
                                                <GroupedAttributeBadges
                                                    attrs={item.attributes}
                                                    itemAttributes={item.item.attributes}
                                                />
                                            </Group>
                                        )}

                                        {item.notes && (
                                            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                Note: {item.notes}
                                            </Text>
                                        )}

                                        {serverSubs.map((sub) => (
                                            <Group key={sub.uuid} gap={4} mt={4} wrap="nowrap">
                                                <Badge
                                                    color="yellow"
                                                    variant="light"
                                                    size="sm"
                                                    style={{ flex: 1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                >
                                                    {sub.itemDescription} ×{sub.quantity}
                                                    {sub.note ? ` — ${sub.note}` : ''}
                                                </Badge>
                                                {assignedToMe && (
                                                    <ActionIcon
                                                        size="xs"
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={() => handleRemoveSubstitution(item.id, sub.uuid)}
                                                        loading={removeSubstitutionApi.loading}
                                                    >
                                                        <IconTrash size={10} />
                                                    </ActionIcon>
                                                )}
                                            </Group>
                                        ))}

                                        {assignedToMe && !isComplete && !showSubForm && (
                                            <Button
                                                mt="xs"
                                                size="xs"
                                                color="yellow"
                                                variant="light"
                                                leftSection={<IconArrowsExchange size={13} />}
                                                onClick={() => openSubstitutionForm(item.id)}
                                            >
                                                Substitute
                                            </Button>
                                        )}

                                        <Collapse in={showSubForm}>
                                            <Box mt="xs" p="xs" style={{ background: theme.colors.gray[0], borderRadius: 6 }}>
                                                <Group justify="space-between" mb="xs">
                                                    <Text size="xs" fw={600}>Add Substitution</Text>
                                                    <CloseButton size="xs" onClick={() => setSubstitutionForm(null)} />
                                                </Group>
                                                <Stack gap="xs">
                                                    <ItemSearch
                                                        onItemSelect={(selected: Item | null) =>
                                                            setSubstitutionForm(prev => prev ? { ...prev, selectedItem: selected } : null)
                                                        }
                                                        placeholder="Search substitute item..."
                                                        size="xs"
                                                    />
                                                    <Textarea
                                                        label="Note (optional)"
                                                        size="xs"
                                                        placeholder="e.g. only L available"
                                                        value={substitutionForm?.note ?? ''}
                                                        onChange={(e) =>
                                                            setSubstitutionForm(prev => prev ? { ...prev, note: e.target.value } : null)
                                                        }
                                                        autosize
                                                        minRows={1}
                                                    />
                                                    <Button
                                                        size="xs"
                                                        color="yellow"
                                                        disabled={!substitutionForm?.selectedItem}
                                                        loading={addSubstitutionApi.loading}
                                                        onClick={submitSubstitution}
                                                    >
                                                        Add Substitution
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Collapse>
                                    </Box>

                                    {assignedToMe && (
                                        <ActionIcon
                                            size="lg"
                                            color={isComplete ? (isSubstituted ? 'yellow' : 'green') : 'gray'}
                                            variant={isComplete ? 'light' : 'outline'}
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
                <Box mb="md">
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" fw={500}>Packing Progress</Text>
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

                    {hasStateChanged ? (
                        <Button
                            disabled={!assignedToMe}
                            onClick={saveProgress}
                            color="blue"
                            size="sm"
                            p={'xs'}
                            style={{ marginLeft: 'auto' }}
                        >
                            Save Progress
                        </Button>
                    ) : (
                        <Button
                            disabled={!assignedToMe}
                            onClick={handlePlaceInWagonClick}
                            color="green"
                            p={'xs'}
                            size="sm"
                            style={{ marginLeft: 'auto' }}
                        >
                            Done Packing
                        </Button>
                    )}
                </Group>
            </Box>

            <PlaceInWagonModal
                opened={placeInWagonModalOpened}
                onClose={() => setPlaceInWagonModalOpened(false)}
                onConfirm={confirmPlaceInWagon}
                unhandledItems={unhandledItems}
                loading={updateStatus.loading}
                onPrintLabel={handlePrintLabel}
                printLabelLoading={printLabel.loading}
                printingEnabled={printOnTransitionToStatus !== null}
            />
        </Box>
    );
}

export default PackingView;
