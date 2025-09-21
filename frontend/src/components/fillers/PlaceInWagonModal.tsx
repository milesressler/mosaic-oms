import { Modal, Text, Button, Group, List, Box, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { OrderItem } from 'src/models/types';

interface PlaceInWagonModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    unfilledItems: OrderItem[];
    loading?: boolean;
}

export function PlaceInWagonModal({ 
    opened, 
    onClose, 
    onConfirm, 
    unfilledItems,
    loading = false
}: PlaceInWagonModalProps) {
    const hasUnfilledItems = unfilledItems.length > 0;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Place Order in Wagon"
            centered
        >
            <Box mb="md">
                {hasUnfilledItems ? (
                    <>
                        <Alert 
                            icon={<IconAlertTriangle size="1rem" />} 
                            color="orange" 
                            mb="md"
                        >
                            This order has {unfilledItems.length} unfilled item{unfilledItems.length > 1 ? 's' : ''}
                        </Alert>
                        
                        <Text size="sm" mb="sm" fw={500}>
                            Unfilled items:
                        </Text>
                        <List size="sm" mb="lg">
                            {unfilledItems.map(item => (
                                <List.Item key={item.id}>
                                    {item.description}
                                    {item.quantityFulfilled > 0 && (
                                        <Text span c="dimmed" size="xs">
                                            {' '}({item.quantityFulfilled}/{item.quantityRequested} filled)
                                        </Text>
                                    )}
                                </List.Item>
                            ))}
                        </List>
                        
                        <Text size="sm" c="dimmed">
                            Are you sure you want to place this order in the wagon?
                        </Text>
                    </>
                ) : (
                    <Text size="sm">
                        Ready to place this fully packed order in the wagon?
                    </Text>
                )}
            </Box>

            <Group justify="flex-end">
                <Button 
                    variant="subtle" 
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    color="green"
                    onClick={onConfirm}
                    loading={loading}
                >
                    {'Place in Wagon'}
                </Button>
            </Group>
        </Modal>
    );
}

export default PlaceInWagonModal;
