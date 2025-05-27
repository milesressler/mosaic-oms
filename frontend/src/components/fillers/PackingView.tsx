import { Button, Group, Text, Paper, Divider, Box, Loader } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import ItemQuantitySelector from 'src/components/fillers/ItemQuantitySelector.tsx';
import {OrderDetails, OrderItem, OrderStatus} from 'src/models/types.tsx';
import { useSelectedOrder } from 'src/contexts/SelectedOrderContext.tsx';
import { useEffect, useState } from 'react';
import useApi from 'src/hooks/useApi.tsx';
import ordersApi from 'src/services/ordersApi.tsx';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from 'src/contexts/FeaturesContext.tsx';
import {useAuth0} from "@auth0/auth0-react";
import {useOrderFulfillmentTracking} from "src/hooks/useOrderFulfillmentTracking.tsx";

function PackingView() {
    const { selectedOrder, doForceRefresh } = useSelectedOrder();
    const updateQuantities = useApi(ordersApi.updateOrderItems);
    const updateStatus = useApi(ordersApi.updateOrderStatus);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const navigate = useNavigate();
    const { printOnTransitionToStatus } = useFeatures();
    const { user } = useAuth0();
    const { startFilling, completeFilling } = useOrderFulfillmentTracking();

    useEffect(() => {
        if (updateStatus.data?.orderStatus === OrderStatus.PACKED) {
            navigate('dashboard/filler');
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

    const moveToWagon = () => {
        updateStatus.request(selectedOrder!.uuid, OrderStatus.PACKED);
    };

    const hasStateChanged = draftItems.some(
        (draftItem) => draftItem.quantityFulfilled !== selectedOrder?.items.find((item) => item.id === draftItem.id)?.quantityFulfilled
    );

    if (!selectedOrder) return <Loader />;
    const assignedToMe = (selectedOrder as OrderDetails)?.assignee?.externalId === user?.sub;


    return (
        <Paper p="md" shadow="xs">
            <Box>
                {draftItems.map((item) => (
                    <Box key={item.id} mb="sm" pr={'xl'}>
                        <Group justify="space-between">
                            <Text>
                                <strong>{item.quantityRequested}</strong> {item.description}
                            </Text>
                            <Text c="dimmed">
                                {item.quantityFulfilled === item.quantityRequested
                                    ? 'Complete'
                                    : `${item.quantityFulfilled} / ${item.quantityRequested - item.quantityFulfilled} `}
                            </Text>
                        </Group>
                        <Group justify="start">
                            <Text c="dimmed" size={'sm'}>{item.notes}</Text>
                            {Object.entries(item.attributes).map(([key, value]) => (
                                <Group key={key} gap={0 }>
                                    <Text fw={600}>{key}:</Text>
                                    <Text>{value}</Text>
                                </Group>
                                ))
                            }
                        </Group>
                        { assignedToMe &&

                        <ItemQuantitySelector
                            quantitySelected={item.quantityFulfilled}
                            onValueChange={(value) => updateDraftItemQuantityFulfilled(item.id, value)}
                            max={item.quantityRequested}
                        />
                        }
                        <Divider mt={5}/>
                    </Box>
                ))}
            </Box>

            <Divider my="md" />

            <Group justify="space-between" gap={2}>
                <Group gap="xs">
                    <Button variant="light" onClick={clearAll}>Clear All</Button>
                    <Button variant="light" onClick={fillAll}>Fill All</Button>
                </Group>
                <Group>
                    {hasStateChanged ? (
                        <Button onClick={saveProgress}>Save Progress</Button>
                    ) : (
                        <Button
                            onClick={moveToWagon}
                            leftSection={printOnTransitionToStatus === OrderStatus.PACKED && <IconPrinter />}
                        >
                            Placed in Wagon
                        </Button>
                    )}
                </Group>
            </Group>
        </Paper>
    );
}

export default PackingView;
