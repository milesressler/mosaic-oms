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
    Progress
} from '@mantine/core';
import {
    IconPrinter,
    IconSquare,
    IconCheckbox
} from '@tabler/icons-react';
import {OrderDetails, OrderItem, OrderStatus} from 'src/models/types.tsx';
import { useSelectedOrder } from 'src/context/SelectedOrderContext.tsx';
import { useEffect, useState } from 'react';
import useApi from 'src/hooks/useApi.tsx';
import ordersApi from 'src/services/ordersApi.tsx';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from 'src/context/FeaturesContext.tsx';
import {useAuth0} from "@auth0/auth0-react";
import {useOrderFulfillmentTracking} from "src/hooks/useOrderFulfillmentTracking.tsx";
import AttributeBadges from 'src/components/common/items/AttributeBadges';
import PlaceInWagonModal from './PlaceInWagonModal';

function PackingView() {
    const { selectedOrder, doForceRefresh } = useSelectedOrder();
    const updateQuantities = useApi(ordersApi.updateOrderItems);
    const updateStatus = useApi(ordersApi.updateOrderStatus);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const [placeInWagonModalOpened, setPlaceInWagonModalOpened] = useState(false);
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
        if (unfilledItems.length > 0) {
            setPlaceInWagonModalOpened(true);
        } else {
            // All items filled, go directly to wagon
            updateStatus.request(selectedOrder!.uuid, OrderStatus.PACKED);
        }
    };

    const confirmPlaceInWagon = () => {
        updateStatus.request(selectedOrder!.uuid, OrderStatus.PACKED);
        setPlaceInWagonModalOpened(false);
    };

    const hasStateChanged = draftItems.some(
        (draftItem) => draftItem.quantityFulfilled !== selectedOrder?.items.find((item) => item.id === draftItem.id)?.quantityFulfilled
    );

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
                                                    <AttributeBadges attrs={item.attributes} />
                                                )}
                                            </Group>
                                        )}

                                        {item.notes && (
                                            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                Note: {item.notes}
                                            </Text>
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
                            leftSection={printOnTransitionToStatus === OrderStatus.PACKED && <IconPrinter />}
                            style={{ marginLeft: 'auto' }}
                        >
                            Place in Wagon
                        </Button>
                    )}
                </Group>
            </Box>

            <PlaceInWagonModal
                opened={placeInWagonModalOpened}
                onClose={() => setPlaceInWagonModalOpened(false)}
                onConfirm={confirmPlaceInWagon}
                unfilledItems={unfilledItems}
                loading={updateStatus.loading}
            />
        </Box>
    );
}

export default PackingView;
