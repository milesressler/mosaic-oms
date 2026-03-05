import { Modal, Text, Button, Group, List, Box, Alert } from '@mantine/core';
import { IconAlertTriangle, IconPrinter } from '@tabler/icons-react';
import { OrderItem } from 'src/models/types';

interface PlaceInWagonModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    unfilledItems: OrderItem[];
    loading?: boolean;
    onPrintLabel?: () => void;
    printLabelLoading?: boolean;
    printingEnabled?: boolean;
}

export function PlaceInWagonModal({ 
    opened, 
    onClose, 
    onConfirm, 
    unfilledItems,
    loading = false,
    onPrintLabel,
    printLabelLoading = false,
    printingEnabled = false
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
                        {printingEnabled && (
                            <Text size="sm" c="dimmed" mt="xs">
                                Print a label if needed, then place the order in the wagon.
                            </Text>
                        )}
                    </Text>
                )}
            </Box>

            <Group justify="flex-end">
                <Button 
                    variant="subtle" 
                    onClick={onClose}
                    disabled={loading || printLabelLoading}
                >
                    Cancel
                </Button>
                {printingEnabled && onPrintLabel && (
                    <Button 
                        variant="outline"
                        color="blue"
                        onClick={onPrintLabel}
                        loading={printLabelLoading}
                        disabled={loading}
                        leftSection={<IconPrinter size={16} />}
                    >
                        Print Label
                    </Button>
                )}
                <Button 
                    color="green"
                    onClick={onConfirm}
                    loading={loading}
                    disabled={printLabelLoading}
                >
                    Place in Wagon
                </Button>
            </Group>
        </Modal>
    );
}

export default PlaceInWagonModal;
