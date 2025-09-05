import { Paper, Text, Group, Badge, Stack } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { OrderDetails } from 'src/models/types';
import { statusDisplay } from 'src/utils/StatusUtils';

interface OrderPreviewProps {
  order: OrderDetails;
}

export default function OrderPreview({ order }: OrderPreviewProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/order/${order.id}`);
  };

  return (
    <Paper 
      p="sm" 
      radius="md" 
      bg="blue.0" 
      mt="xs" 
      style={{ 
        border: '1px solid var(--mantine-color-blue-2)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <IconPackage size={16} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={600} c="blue.8">
              Order #{order.id}
            </Text>
          </Group>
          <Badge size="sm" variant="light" color={order.orderStatus === 'COMPLETED' ? 'green' : 'blue'}>
            {statusDisplay(order.orderStatus)}
          </Badge>
        </Group>
        
        <Text size="xs" c="dimmed">
          Customer: {order.customer.firstName} {order.customer.lastName}
        </Text>
        
        {order.assignee && (
          <Text size="xs" c="dimmed">
            Assigned to: {order.assignee.name}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}