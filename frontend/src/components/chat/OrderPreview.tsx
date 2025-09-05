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

  // Smart name formatting: try full name first, fallback to first + last initial
  const getDisplayName = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    // Handle missing names defensively
    if (!first && !last) return 'Unknown Customer';
    if (!first) return last;
    if (!last) return first;
    
    const fullName = `${first} ${last}`;
    // If full name is reasonable length (under 20 chars), use it
    if (fullName.length <= 20) {
      return fullName;
    }
    // Otherwise use first name + last initial
    return `${first} ${last.charAt(0)}.`;
  };

  // Format assignee display
  const getAssigneeDisplay = () => {
    if (!order.assignee?.name?.trim()) {
      return <Text size="xs" c="orange.6" fs="italic">Unassigned</Text>;
    }
    return (
      <Text size="xs" c="dimmed">
        Assigned: {order.assignee.name}
      </Text>
    );
  };

  return (
    <Paper 
      p="xs" 
      radius="sm" 
      bg="blue.0" 
      style={{ 
        border: '1px solid var(--mantine-color-blue-2)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
    >
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gridTemplateRows: 'auto auto',
        gap: '2px 8px',
        alignItems: 'start'
      }}>
        {/* Row 1, Col 1: Icon */}
        <IconPackage size={14} color="var(--mantine-color-blue-6)" style={{ gridRow: '1', gridColumn: '1' }} />
        
        {/* Row 1, Col 2: Customer Name (can wrap) */}
        <Text size="xs" fw={600} c="blue.8" style={{ 
          gridRow: '1', 
          gridColumn: '2', 
          lineHeight: 1.3,
          wordBreak: 'break-word'
        }}>
          #{order.id} • {getDisplayName(order.customer.firstName, order.customer.lastName)}
        </Text>
        
        {/* Row 1, Col 3: Badge */}
        <Badge size="xs" variant="light" color={order.orderStatus === 'COMPLETED' ? 'green' : 'blue'} style={{
          gridRow: '1',
          gridColumn: '3',
          alignSelf: 'start'
        }}>
          {statusDisplay(order.orderStatus)}
        </Badge>
        
        {/* Row 2, Col 2-3: Assignee (spans middle and right columns) */}
        <div style={{ gridRow: '2', gridColumn: '2 / 4' }}>
          {getAssigneeDisplay()}
        </div>
      </div>
    </Paper>
  );
}