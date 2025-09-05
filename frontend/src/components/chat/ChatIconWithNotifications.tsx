import { ActionIcon, Badge, Box } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useSubscription } from 'react-stomp-hooks';
import { useAuth0 } from '@auth0/auth0-react';
import { ChatNotification } from 'src/models/chat';

interface ChatIconWithNotificationsProps {
  asideOpened: boolean;
  onToggle: () => void;
  size?: number;
}

export default function ChatIconWithNotifications({ 
  asideOpened, 
  onToggle, 
  size = 18 
}: ChatIconWithNotificationsProps) {
  const { user } = useAuth0();
  const [globalUnread, setGlobalUnread] = useState(0);
  const [dmUnread, setDmUnread] = useState(0);

  // Listen for global messages
  useSubscription('/topic/chat/global', (message) => {
    if (!asideOpened) {
      const notification: ChatNotification = JSON.parse(message.body);
      // Don't count our own messages
      if (notification.message.sender.externalId !== user?.sub) {
        setGlobalUnread(prev => prev + 1);
      }
    }
  });

  // Listen for direct messages
  useSubscription(`/topic/chat/dm/${user?.sub}`, (message) => {
    if (!asideOpened) {
      const notification: ChatNotification = JSON.parse(message.body);
      // Don't count our own messages
      if (notification.message.sender.externalId !== user?.sub) {
        setDmUnread(prev => prev + 1);
      }
    }
  });

  // Clear unread count when chat is opened
  useEffect(() => {
    if (asideOpened) {
      setGlobalUnread(0);
      setDmUnread(0);
    }
  }, [asideOpened]);

  const totalUnread = globalUnread + dmUnread;
  const hasDmUnread = dmUnread > 0;

  return (
    <Box style={{ position: 'relative' }}>
      <ActionIcon
        variant={asideOpened ? "filled" : "subtle"}
        onClick={onToggle}
      >
        <IconMessageCircle size={size} />
      </ActionIcon>
      
      {totalUnread > 0 && (
        <Badge
          size="xs"
          variant="filled"
          color={hasDmUnread ? "red" : "blue"}
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
          {totalUnread > 99 ? '99+' : totalUnread}
        </Badge>
      )}
    </Box>
  );
}