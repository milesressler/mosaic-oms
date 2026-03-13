import {
    Group,
    Text,
    Box,
    Stack,
    Divider,
    Badge,
} from '@mantine/core';
import { useSelectedOrder } from 'src/context/SelectedOrderContext.tsx';
import GroupedAttributeBadges from 'src/components/common/items/GroupedAttributeBadges';
import {Category, categoryDisplayNames} from "src/models/types.tsx";

function OrderItemListView() {
    const { selectedOrder } = useSelectedOrder();

    if (!selectedOrder) return null;

    const getSubTotal = (itemId: number): number =>
        selectedOrder.items?.find(i => i.id === itemId)?.substitutions?.reduce((s, sub) => s + sub.quantity, 0) ?? 0;

    // Unhandled: nothing exact-filled AND no substitutions
    const unfulfilledItems = selectedOrder.items?.filter(item =>
        (item.quantityFulfilled || 0) === 0 && getSubTotal(item.id) === 0
    ) || [];

    // Substituted: has at least one substitution (may also be partially exact-filled)
    const substitutedItems = selectedOrder.items?.filter(item =>
        (item.substitutions?.length ?? 0) > 0
    ) || [];

    // Fully exact-filled with no substitution
    const fulfilledItems = selectedOrder.items?.filter(item =>
        (item.quantityFulfilled || 0) > 0 && (item.substitutions?.length ?? 0) === 0
    ) || [];

    const fulfilledByCategory = fulfilledItems.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, typeof fulfilledItems>);

    const sortedCategories = Object.keys(fulfilledByCategory).sort();

    return (
        <Box>
            {/* Unfulfilled items */}
            {unfulfilledItems.length > 0 && (
                <Box mb="md">
                    <Text size="sm" fw={600} c="red" mb="xs">
                        NOT INCLUDED:
                    </Text>
                    <Stack gap="xs">
                        {unfulfilledItems.map((item) => (
                            <Box key={item.id} ml="sm">
                                <Text size="sm" td="line-through" c="dimmed">
                                    {item.description}
                                </Text>
                                {item.notes && (
                                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }} ml="md">
                                        {item.notes}
                                    </Text>
                                )}
                            </Box>
                        ))}
                    </Stack>
                    {(substitutedItems.length > 0 || fulfilledItems.length > 0) && <Divider my="md" />}
                </Box>
            )}

            {/* Substituted items */}
            {substitutedItems.length > 0 && (
                <Box mb="md">
                    <Text size="sm" fw={600} c="yellow.7" mb="xs">
                        SUBSTITUTED:
                    </Text>
                    <Stack gap="xs">
                        {substitutedItems.map((item) => (
                            <Box key={item.id} ml="sm">
                                <Group gap="xs" align="center">
                                    <Text size="sm" fw={500} td={(item.quantityFulfilled || 0) === 0 ? 'line-through' : undefined} c={(item.quantityFulfilled || 0) === 0 ? 'dimmed' : undefined}>
                                        {item.description}
                                    </Text>
                                    <Badge color="yellow" size="xs" variant="filled">SUB</Badge>
                                </Group>
                                {item.substitutions?.map(sub => (
                                    <Text key={sub.uuid} size="xs" c="yellow.7" ml="md">
                                        ↳ {sub.itemDescription} ×{sub.quantity}
                                        {sub.note ? ` (${sub.note})` : ''}
                                    </Text>
                                ))}
                                {item.notes && (
                                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }} ml="md">
                                        {item.notes}
                                    </Text>
                                )}
                            </Box>
                        ))}
                    </Stack>
                    {fulfilledItems.length > 0 && <Divider my="md" />}
                </Box>
            )}

            {/* Fulfilled items grouped by category */}
            <Stack gap="md">
                {sortedCategories.map((category, categoryIndex) => (
                    <Box key={category}>
                        <Text size="sm" fw={600} c="dark" mb="xs">
                            {categoryDisplayNames[category as Category]}:
                        </Text>
                        <Stack gap="xs">
                            {fulfilledByCategory[category].map((item) => (
                                <Box key={item.id} ml="sm">
                                    <Text size="sm" fw={500}>
                                        {item.description}
                                    </Text>
                                    {(Object.keys(item.attributes).length > 0 || item.notes) && (
                                        <Group gap="xs" ml="md" wrap="wrap" style={{ marginTop: 2 }}>
                                            {Object.keys(item.attributes).length > 0 && (
                                                <GroupedAttributeBadges
                                                    attrs={item.attributes}
                                                    itemAttributes={item.item.attributes}
                                                />
                                            )}
                                            {item.notes && (
                                                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                                    {item.notes}
                                                </Text>
                                            )}
                                        </Group>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                        {categoryIndex < sortedCategories.length - 1 && <Divider my="sm" />}
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}

export default OrderItemListView;
