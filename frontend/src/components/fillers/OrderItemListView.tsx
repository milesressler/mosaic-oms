import { 
    Group, 
    Text, 
    Box, 
    Stack,
    Divider
} from '@mantine/core';
import { useSelectedOrder } from 'src/context/SelectedOrderContext.tsx';
import AttributeBadges from 'src/components/common/items/AttributeBadges';
import {Category, categoryDisplayNames} from "src/models/types.tsx";

function OrderItemListView() {
    const { selectedOrder } = useSelectedOrder();

    if (!selectedOrder) return null;

    // Separate and sort items: unfulfilled first, then fulfilled by category
    const unfulfilledItems = selectedOrder.items?.filter(item => (item.quantityFulfilled || 0) === 0) || [];
    const fulfilledItems = selectedOrder.items?.filter(item => (item.quantityFulfilled || 0) > 0) || [];

    // Group fulfilled items by category
    const fulfilledByCategory = fulfilledItems.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, typeof fulfilledItems>);

    // Sort categories alphabetically
    const sortedCategories = Object.keys(fulfilledByCategory).sort();

    return (
        <Box>
            {/* Unfulfilled items first */}
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
                                    {/* Attributes and notes on same line, minimal spacing */}
                                    {(Object.keys(item.attributes).length > 0 || item.notes) && (
                                        <Group gap="xs" ml="md" wrap="wrap" style={{ marginTop: 2 }}>
                                            {Object.keys(item.attributes).length > 0 && (
                                                <AttributeBadges attrs={item.attributes} />
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
