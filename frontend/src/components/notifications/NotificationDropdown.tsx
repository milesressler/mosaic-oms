import { useState, useEffect } from 'react';
import { Menu, Text, Stack, Group, Badge, ActionIcon, ScrollArea, Box, Divider } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import useApi from 'src/hooks/useApi';
import notificationsApi from 'src/services/notificationsApi';
import { NotificationResponse, NotificationType } from 'src/models/types';
import { useSubscription } from 'react-stomp-hooks';

interface NotificationDropdownProps {
  size?: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function getNotificationMessage(notification: NotificationResponse): string {
  switch (notification.type) {
    case NotificationType.NEEDS_MORE_INFO:
      const orderNumber = notification.relatedOrder?.id || 'Unknown';
      const comment = notification.message || 'No details provided';
      return `Order #${orderNumber} needs more information: "${comment}"`;
    default:
      return notification.message || 'You have a new notification';
  }
}

export default function NotificationDropdown({ size = 18 }: NotificationDropdownProps) {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  
  const notificationsApiHook = useApi(notificationsApi.getNotifications);
  const markReadApiHook = useApi(notificationsApi.markNotificationsAsSeen);

  // Subscribe to real-time notifications
  useSubscription(`/topic/notifications/${user?.sub}`, (message) => {
    const newNotification = JSON.parse(message.body);
    console.log('Received notification:', newNotification);
    
    // Add to notifications list and increment unread count
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

  // Load notifications on mount
  useEffect(() => {
    if (user) {
      notificationsApiHook.request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update state when notifications data changes
  useEffect(() => {
    if (notificationsApiHook.data) {
      setNotifications(notificationsApiHook.data.notifications || []);
      setUnreadCount(notificationsApiHook.data.totalUnseen || 0);
    }
  }, [notificationsApiHook.data]);

  const handleDropdownToggle = () => {
    setOpened(!opened);
    
    // Mark notifications as read when opening dropdown
    if (!opened && unreadCount > 0) {
      markReadApiHook.request();
      setUnreadCount(0);
      
      // Update local state to mark all as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, seen: true }))
      );
    }
  };

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={5}
      width={400}
      shadow="lg"
    >
      <Menu.Target>
        <Box style={{ position: 'relative' }}>
          <ActionIcon
            variant="subtle"
            onClick={handleDropdownToggle}
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
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
          <Text fw={600} size="sm">Notifications</Text>
        </Box>
        
        <ScrollArea.Autosize mah={400} mx="auto">
          {notifications.length === 0 ? (
            <Box p="md" ta="center">
              <Text c="dimmed" size="sm">No notifications</Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <Box
                    p="md"
                    style={{
                      backgroundColor: notification.seen ? 'transparent' : '#f8f9fa',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (notification.relatedOrder?.id) {
                        navigate(`/order/${notification.relatedOrder.id}`);
                        setOpened(false);
                      }
                    }}
                  >
                    <Group justify="space-between" align="flex-start" gap="xs">
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" lineClamp={3}>
                          {getNotificationMessage(notification)}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatTimeAgo(notification.created)}
                        </Text>
                      </Box>
                      {!notification.seen && (
                        <Badge size="xs" color="blue" variant="filled" style={{ flexShrink: 0 }}>
                          New
                        </Badge>
                      )}
                    </Group>
                  </Box>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box p="sm" ta="center">
              <Text size="xs" c="dimmed">
                {notifications.length} total notifications
              </Text>
            </Box>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
