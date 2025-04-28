import {Badge, Button, Group, Paper, Text} from '@mantine/core';
import { OrderStatus } from 'src/models/types.tsx';
import { useSelectedOrder } from 'src/contexts/SelectedOrderContext.tsx';
import { useNavigate, useParams } from 'react-router-dom';

function OrderItemListView() {
    const { selectedOrder } = useSelectedOrder();
    const navigate = useNavigate();
    const { id } = useParams();

    const startFilling = () => {
        navigate(`/dashboard/filler/order/${id}`);
    };

    if (!selectedOrder) return null;

    return (
        <>
            {selectedOrder?.orderStatus === OrderStatus.ACCEPTED && (
                <Group justify="center" my="md">
                    <Button onClick={startFilling}>Begin Filling</Button>
                </Group>
            )}
            <Paper shadow="xs" p="md">
                {selectedOrder?.items?.map((item) => (<>
                    <Group key={item.id} justify={'space-between'}>
                        <Text>
                            <strong>{item.quantityRequested}</strong> {item.description} <Text c="dimmed">{item.notes}</Text>
                        </Text>
                    </Group>
                    <Group key={item.id} justify={'space-between'} mb="sm">
                            {
                                Object.entries(item.attributes)?.map(([k,v]) =>
                                    <Badge variant={'outline'} size={'xs'} c={'dimmed'}>{k}:{v}</Badge>
                                )
                            }
                    </Group>
            </>
                ))}
            </Paper>
        </>
    );
}

export default OrderItemListView;
