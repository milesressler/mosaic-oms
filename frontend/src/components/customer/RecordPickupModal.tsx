import {Alert, Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput} from "@mantine/core";
import {DateInput} from "@mantine/dates";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import useApi from "src/hooks/useApi.tsx";
import CustomersApi from "src/services/customersApi.tsx";
import {CreateItemLimitEntryResponse} from "src/models/types.tsx";
import {LIMIT_ZONE} from "src/utils/ItemLimitUtils.tsx";

interface Props {
    customerUuid: string;
    opened: boolean;
    onClose: () => void;
    onSaved: (response: CreateItemLimitEntryResponse) => void;
    /** Preselect and lock the item, e.g. when recording from a line on an order */
    itemId?: number;
    /** The order being filled, so its limits are re-checked with this pickup */
    orderUuid?: string;
}

const today = () => DateTime.now().setZone(LIMIT_ZONE).toISODate()!;

/**
 * Record a pickup of a limited item that happened outside the system, e.g. from an old spreadsheet log.
 */
export function RecordPickupModal({customerUuid, opened, onClose, onSaved, itemId, orderUuid}: Props) {
    const limitsApi = useApi(CustomersApi.getItemLimits);
    const createApi = useApi(CustomersApi.createItemLimitEntry);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(itemId ? String(itemId) : null);
    const [receivedOn, setReceivedOn] = useState<string | null>(today());
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (!opened) return;
        // Start fresh each time it opens
        setSelectedItemId(itemId ? String(itemId) : null);
        setReceivedOn(today());
        setQuantity(1);
        setNotes('');
        limitsApi.request(customerUuid);
    }, [opened, customerUuid, itemId]);

    const save = async () => {
        if (!selectedItemId || !receivedOn) return;
        const result = await createApi.request(customerUuid, {
            itemId: Number(selectedItemId),
            receivedOn,
            quantity,
            notes: notes.trim() || undefined,
            orderUuid,
        });
        if (result) {
            onSaved(result.data);
            onClose();
        }
    };

    const itemOptions = (limitsApi.data ?? []).map((limit) => ({
        value: String(limit.itemId),
        label: limit.description,
    }));

    return (
        <Modal opened={opened} onClose={onClose} title="Record past pickup">
            <Stack gap="sm">
                <Text size="sm" c="dimmed">
                    For limited items this customer received outside the system. It counts toward their limit
                    just like a completed order.
                </Text>
                <Select
                    label="Item"
                    placeholder="Choose a limited item"
                    data={itemOptions}
                    value={selectedItemId}
                    onChange={setSelectedItemId}
                    disabled={!!itemId}
                    searchable
                    required
                    nothingFoundMessage={limitsApi.loading ? 'Loading…' : 'No limited items'}
                />
                <Group grow align="start">
                    <DateInput
                        label="Date received"
                        value={receivedOn}
                        onChange={setReceivedOn}
                        maxDate={today()}
                        required
                    />
                    <NumberInput
                        label="Quantity"
                        min={1}
                        allowDecimal={false}
                        value={quantity}
                        onChange={(value) => setQuantity(Number(value) || 1)}
                        required
                    />
                </Group>
                <TextInput
                    label="Note (optional)"
                    placeholder="e.g. from the intake sheet"
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                />
                {createApi.error && <Alert color="red" variant="light">{createApi.error}</Alert>}
                <Group justify="end">
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button onClick={save} loading={createApi.loading} disabled={!selectedItemId || !receivedOn}>
                        Save
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export default RecordPickupModal;
