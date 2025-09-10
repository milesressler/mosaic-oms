import { useState, useEffect } from 'react';
import { Alert, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { OrderStatus } from 'src/models/types';
import useApi from 'src/hooks/useApi';
import ordersApi from 'src/services/ordersApi';

export default function NeedsInfoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [needsInfoCount, setNeedsInfoCount] = useState(0);
  
  // Get count of NEEDS_INFO orders
  const needsInfoOrders = useApi(ordersApi.getOrders);

  useEffect(() => {
    // Fetch orders with NEEDS_INFO status to get count
    needsInfoOrders.request({
      page: 1,
      size: 1, // We only need the count
      status: OrderStatus.NEEDS_INFO,
    });
  }, []);

  useEffect(() => {
    if (needsInfoOrders.data?.totalElements) {
      setNeedsInfoCount(needsInfoOrders.data.totalElements);
      setDismissed(false); // Show banner when new NEEDS_INFO orders appear
    } else {
      setNeedsInfoCount(0);
    }
  }, [needsInfoOrders.data]);

  // Don't show if no NEEDS_INFO orders or dismissed
  if (needsInfoCount === 0 || dismissed) {
    return null;
  }

  const ordersUrl = `/orders?status=${OrderStatus.NEEDS_INFO}&page=1`;

  return (
    <Alert
      icon={<IconAlertTriangle/>}
      color="yellow"
      withCloseButton={true}
      title={`${needsInfoCount} order${needsInfoCount === 1 ? '' : 's'} need${needsInfoCount === 1 ? 's' : ''} more information`}
      onClose={() => setDismissed(true)}
    >
      <Button
        component={Link}
        to={ordersUrl}
        size="xs"
        variant="filled"
        color="yellow"
      >
        View & Fix Orders
      </Button>
    </Alert>
  );
}
