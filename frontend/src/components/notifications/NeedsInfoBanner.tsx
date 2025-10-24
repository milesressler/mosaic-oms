import { useState, useEffect } from 'react';
import { Alert, Button, Text, Group, Badge, Stack } from '@mantine/core';
import {IconAlertTriangle, IconBasketSearch, IconQuestionMark, IconSpeakerphone, IconUser} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { OrderStatus } from 'src/models/types';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';
import UserAvatar from "src/components/common/userAvatar/UserAvatar.tsx";

interface OrderTakerGroup {
  name: string;
  count: number;
}

export default function NeedsInfoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [needsInfoCount, setNeedsInfoCount] = useState(0);
  const [orderTakerGroups, setOrderTakerGroups] = useState<OrderTakerGroup[]>([]);
  
  // Get all NEEDS_INFO orders with details
  const needsInfoOrders = useApi(ordersApi.getOrders);

  useEffect(() => {
    // Function to fetch NEEDS_INFO orders
    const fetchNeedsInfoOrders = () => {
      needsInfoOrders.request({
        page: 0,
        size: 100, // Get enough to cover all NEEDS_INFO orders
        status: OrderStatus.NEEDS_INFO,
        detailed: true,
      });
    };

    // Initial fetch
    fetchNeedsInfoOrders();

    // Set up interval to refresh every 60 seconds
    const interval = setInterval(fetchNeedsInfoOrders, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (needsInfoOrders.data?.content) {
      const orders = needsInfoOrders.data.content;
      setNeedsInfoCount(needsInfoOrders.data.totalElements || 0);
      
      // Group orders by the original order taker (first entry in history)
      const takerGroups = new Map<string, number>();
      
      orders.forEach((order: any) => {
        // The first entry in history is the original order creation
        const originalTaker = order.history?.[0]?.user?.name || 'Unknown';
        takerGroups.set(originalTaker, (takerGroups.get(originalTaker) || 0) + 1);
      });
      
      // Convert to array and sort by count (highest first)
      const groupsArray = Array.from(takerGroups.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      setOrderTakerGroups(groupsArray);
      setDismissed(false); // Show banner when new NEEDS_INFO orders appear
    } else {
      setNeedsInfoCount(0);
      setOrderTakerGroups([]);
    }
  }, [needsInfoOrders.data]);

  // Don't show if no NEEDS_INFO orders or dismissed
  if (needsInfoCount === 0 || dismissed) {
    return null;
  }

  const ordersUrl = `/orders?status=${OrderStatus.NEEDS_INFO}`;

  return (
    <Alert
      icon={<IconAlertTriangle size={20}/>}
      color="yellow"
      withCloseButton={true}
      title={`${needsInfoCount} order${needsInfoCount === 1 ? '' : 's'} need${needsInfoCount === 1 ? 's' : ''} more information`}
      onClose={() => setDismissed(true)}
      styles={{
        root: { 
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          border: '1px solid #f1c40f',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(241, 196, 15, 0.1)'
        },
        title: { 
          fontWeight: 600,
          color: '#b7950b'
        },
        message: {
          color: '#856404'
        }
      }}
    >
      <Stack gap="sm">
        {orderTakerGroups.length > 0 && (
          <Group gap="xs" wrap="wrap">
            <IconSpeakerphone size={16} color="#856404" />
            {orderTakerGroups.map((group) => (<>
                  {group.count} order(s) taken by <UserAvatar user={{name: group.name}}/>
                </>
            ))}
          </Group>
        )}
        
        <Group justify="flex-end">
          <Button
            component={Link}
            to={ordersUrl}
            size="sm"
            variant="gradient"
            gradient={{ from: '#f39c12', to: '#e67e22' }}
            leftSection={<IconAlertTriangle size={16} />}
            styles={{
              root: {
                boxShadow: '0 2px 6px rgba(243, 156, 18, 0.3)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(243, 156, 18, 0.4)'
                }
              }
            }}
          >
            View & Fix Orders
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
