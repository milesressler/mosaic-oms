import { Modal, Select, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { OrderStatus } from 'src/models/types.tsx';
import { statusDisplay } from 'src/utils/StatusUtils.tsx';

interface ReopenOrderModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (status: OrderStatus) => void;
    orderNumber?: number;
    previousStatus?: OrderStatus;
}

const REOPENABLE_STATUSES: OrderStatus[] = [
    OrderStatus.PENDING_ACCEPTANCE,
    OrderStatus.NEEDS_INFO,
    OrderStatus.ACCEPTED,
    OrderStatus.PACKING,
    OrderStatus.PACKED,
    OrderStatus.IN_TRANSIT,
    OrderStatus.READY_FOR_CUSTOMER_PICKUP,
];

export default function ReopenOrderModal({ opened, onClose, onConfirm, orderNumber, previousStatus }: ReopenOrderModalProps) {
    const defaultStatus = previousStatus ?? OrderStatus.PENDING_ACCEPTANCE;
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(defaultStatus);

    useEffect(() => {
        if (opened) {
            setSelectedStatus(previousStatus ?? OrderStatus.PENDING_ACCEPTANCE);
        }
    }, [opened, previousStatus]);

    const statusOptions = REOPENABLE_STATUSES.map(s => ({
        value: s,
        label: statusDisplay(s),
    }));

    const handleConfirm = () => {
        onConfirm(selectedStatus);
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Reopen Order"
            size="md"
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    {orderNumber ? `Order #${orderNumber}` : 'This order'} will be reopened and returned to the selected status.
                    The previous status has been pre-selected.
                </Text>

                <Select
                    label="Reopen to status"
                    data={statusOptions}
                    value={selectedStatus}
                    onChange={(val) => val && setSelectedStatus(val as OrderStatus)}
                    allowDeselect={false}
                    size="md"
                />

                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button color="orange" onClick={handleConfirm}>
                        Reopen Order
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
