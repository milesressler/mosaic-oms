import { ActionIcon, Badge, Box } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { useEffect, memo } from 'react';
import { useChat } from 'src/context/ChatContext';

interface ChatIconWithNotificationsProps {
  asideOpened: boolean;
  onToggle: () => void;
  size?: number;
}

const ChatIconWithNotifications = memo(function ChatIconWithNotifications({ 
  asideOpened, 
  onToggle, 
  size = 18 
}: ChatIconWithNotificationsProps) {
  const { globalUnreadCount, dmUnreadCount, clearUnreadCounts } = useChat();

  // Clear unread counts when chat is opened
  useEffect(() => {
    if (asideOpened && (globalUnreadCount > 0 || dmUnreadCount > 0)) {
      clearUnreadCounts();
    }
  }, [asideOpened, globalUnreadCount, dmUnreadCount, clearUnreadCounts]);

  const totalUnread = globalUnreadCount + dmUnreadCount;
  const hasDmUnread = dmUnreadCount > 0;

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
});

export default ChatIconWithNotifications;
