import { Blockquote, Box, Group, Text, Title, Divider, Skeleton } from '@mantine/core';
import { OrderDetails, OrderStatus } from 'src/models/types.tsx';
import OrderActionButton from 'src/components/fillers/actionButton/OrderActionButton.tsx';
import { IconNotes } from '@tabler/icons-react';
import UserAvatar from 'src/components/common/userAvatar/UserAvatar.tsx';

interface Props {
    orderDetails: OrderDetails | null;
    loading: boolean;
    changeState: (status: OrderStatus, comment?: string) => void;
    toggleAssigned: () => void;
}

export function OrderInfoBlock({ orderDetails, loading, changeState, toggleAssigned }: Props) {
    if (loading) {
        return (
            <Box p="md">
                <Skeleton height={30} mb="sm" />
                <Skeleton height={50} mb="sm" />
                <Skeleton height={30} mb="sm" />
                <Skeleton height={30} />
            </Box>
        );
    }

    return (
        <Box >
            {/*<Paper shadow="sm" p="md">*/}
                <Group justify="space-between" mb={10}>
                    <Title order={2}>Order: {orderDetails?.id}</Title>
                    <OrderActionButton
                        onStateChange={changeState}
                        toggleAssigned={toggleAssigned}
                        order={orderDetails}
                        loading={loading}
                    />
                </Group>

                <Divider my="sm" />

                <Text>
                    <Text span c="gray.6">Customer:</Text> {`${orderDetails?.customer?.firstName || ''} ${orderDetails?.customer?.lastName || ''}`.trim()}
                </Text>

                <Text mt="sm">
                    <Group gap="xs" align="center">
                        <Text span c="gray.6">Assignee:</Text>{' '}
                        {orderDetails?.assignee ? (
                            <UserAvatar user={orderDetails.assignee} />
                        ) : (
                            <Text fw={600} span c="gray.6">[unassigned]</Text>
                        )}

                    </Group>
                </Text>

                {orderDetails?.specialInstructions && (
                    <Box mt="sm">
                        <Blockquote color="green" icon={<IconNotes />} iconSize={15} radius={5} p={8}>
                            {orderDetails?.specialInstructions}
                        </Blockquote>
                    </Box>
                )}
            {/*</Paper>*/}
        </Box>
    );
}

export default OrderInfoBlock;
