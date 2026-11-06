import {Text} from '@mantine/core';
import {modals} from '@mantine/modals';

interface ConfirmUnfillOptions {
    itemDescription: string;
    orderId: number;
    // Optional extra context shown after the order number, e.g. the date received
    detail?: string;
    onConfirm: () => void;
}

/**
 * Asks before clearing the fill on a line of a completed order, for when the customer gave the item back.
 */
export const confirmUnfillOrderItem = ({itemDescription, orderId, detail, onConfirm}: ConfirmUnfillOptions): string =>
    modals.openConfirmModal({
        title: 'Mark as not filled',
        children: (
            <Text size="sm" mt={'xs'}>
                Mark {itemDescription} on <strong>Order #{orderId}</strong>{detail ? ` (${detail})` : ''} as not
                filled? Use this when the item was given back, e.g. it didn't fit. It will no longer show as
                received, or count toward any limit.
            </Text>
        ),
        labels: {confirm: 'Mark not filled', cancel: 'Cancel'},
        confirmProps: {color: 'red'},
        onConfirm,
    });
