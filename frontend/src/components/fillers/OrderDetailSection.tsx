import {Box, Card, Group, Text, Alert, LoadingOverlay, Stack} from "@mantine/core";
import { Outlet } from "react-router-dom";
import { useSelectedOrder } from "src/context/SelectedOrderContext";
import {IconAlertTriangle, IconCalendar, IconUser} from '@tabler/icons-react';
import { OrderStatus } from "src/models/types.tsx";
import { useEffect } from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import OrderActionButton from "src/components/fillers/actionButton/OrderActionButton.tsx";
import UserAvatar from "src/components/common/userAvatar/UserAvatar.tsx";
import { DateTime } from 'luxon';

interface OrderDetailsProps {
    unselectOrder?: () => void;
    onUpdate?: () => void;
}

export function OrderDetailSection({ unselectOrder, onUpdate }: OrderDetailsProps) {
    const { doForceRefresh, loading, selectedOrder } = useSelectedOrder();
    const { user } = useAuth0();
    const updateStateApi = useApi(ordersApi.updateOrderStatus);
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);

    const assignedToMe = selectedOrder?.assignee?.externalId === user?.sub;

    useEffect(() => {
        if (updateStateApi.data) {
            if (onUpdate) {
                onUpdate();
            }
            doForceRefresh();
        }
    }, [updateStateApi.data]);

    useEffect(() => {
        if (changeAssigneeApi.data) {
            if (onUpdate) {
                onUpdate();
            }
            doForceRefresh();
        }
    }, [changeAssigneeApi.data]);

    const isLoading = changeAssigneeApi.loading || loading || updateStateApi.loading;

    const toggleAssigned = () => {
        return changeAssigneeApi.request(selectedOrder!.uuid, assignedToMe);
    };

    const changeState = (orderStatus: OrderStatus, comment?: string) => {
        if (orderStatus === OrderStatus.ACCEPTED
            || orderStatus === OrderStatus.CANCELLED
            || orderStatus === OrderStatus.NEEDS_INFO
            || orderStatus === OrderStatus.COMPLETED) {
            const request = comment ? { comment } : undefined;
            updateStateApi.request(selectedOrder!.uuid, orderStatus, request);
        }
        if (orderStatus === OrderStatus.CANCELLED || orderStatus === OrderStatus.NEEDS_INFO) {
            doForceRefresh();
            if (unselectOrder) {
                unselectOrder();
            }
            if (onUpdate) {
                onUpdate();
            }
        }
    };

    if (!selectedOrder) {
        return (
            <Box ta="center" py="xl">
                <Text c="dimmed">No order selected</Text>
            </Box>
        );
    }

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} />

            {/* Error messages */}
            {(updateStateApi.error || changeAssigneeApi.error) && (
                <Alert icon={<IconAlertTriangle size="1rem" />} color="red" mb="md">
                    {updateStateApi.error || changeAssigneeApi.error}
                </Alert>
            )}

            {/* Status and controls */}
            <Card mb="xs" p="xs">
                    {/* Top row: Action button only */}
                    <Group justify="space-between">
                        <Stack gap="xs">
                            {/* Assignee with avatar */}

                            <Group gap="xs" align="center">

                                <IconUser size={14} />
                                {selectedOrder.assignee && <Text size="xs" c="dimmed" fw={500}>
                                    Assigned to
                                </Text> }
                                <UserAvatar
                                    user={selectedOrder.assignee ?? {name: 'Unassigned'}}
                                />
                            </Group>

                            {/* Created time */}
                            <Group gap="xs" align="center">
                                <IconCalendar size={14} />
                                <Text size="xs" c="dimmed">
                                    Created {DateTime.fromISO(selectedOrder.created).toRelative()}
                                </Text>
                            </Group>
                        </Stack>
                        <OrderActionButton
                            onStateChange={changeState}
                            toggleAssigned={toggleAssigned}
                            order={selectedOrder}
                            loading={isLoading}
                        />
                    </Group>

            </Card>

            {/* Special Instructions - only show if present */}
            {selectedOrder.specialInstructions && (
                <Alert 
                    icon={<IconAlertTriangle size="1rem" />} 
                    title="Special Instructions" 
                    color="blue" 
                    mb="md"
                >
                    {selectedOrder.specialInstructions}
                </Alert>
            )}

            {/* Main packing interface */}
            <Outlet />
        </Box>
    );
}

export default OrderDetailSection;
