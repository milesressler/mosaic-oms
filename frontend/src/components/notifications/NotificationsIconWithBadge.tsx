import { ActionIcon, Badge, Box } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useEffect, useState, memo } from 'react';
import { useSubscription } from 'react-stomp-hooks';
import { useAuth0 } from '@auth0/auth0-react';
import useApi from 'src/hooks/useApi';
import notificationsApi from 'src/services/notificationsApi';
import { OrderNotification } from 'src/models/types';

interface NotificationsIconWithBadgeProps {
  size?: number;
}

const NotificationsIconWithBadge = memo(function NotificationsIconWithBadge({ 
  size = 18 
}: NotificationsIconWithBadgeProps) {
  const { user } = useAuth0();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notificationsApiHook = useApi(notificationsApi.getNotifications);

  // Subscribe to real-time notifications for current user
  useSubscription(`/topic/notifications/${user?.sub}`, (message) => {
    const notification: OrderNotification = JSON.parse(message.body);
    console.log('Received notification:', notification);
    // Increment unread count when new notification arrives
    setUnreadCount(prev => prev + 1);
  });

  // Load notifications on mount to get unread count
  useEffect(() => {
    if (user) {
      notificationsApiHook.request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update unread count when data changes
  useEffect(() => {
    if (notificationsApiHook.data?.totalUnseen) {
      setUnreadCount(notificationsApiHook.data.totalUnseen);
    } else if (notificationsApiHook.data?.totalUnseen === 0) {
      setUnreadCount(0);
    }
  }, [notificationsApiHook.data]);

  const handleClick = () => {
    // For now, just log - we'll implement the dropdown later
    console.log('Notifications clicked!');
  };

  return (
    <Box style={{ position: 'relative' }}>
      <ActionIcon
        variant="subtle"
        onClick={handleClick}
      >
        <IconBell size={size} />
      </ActionIcon>
      
      {unreadCount > 0 && (
        <Badge
          size="xs"
          variant="filled"
          color="red"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            pointerEvents: 'none'
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Box>
  );
});

export default NotificationsIconWithBadge;