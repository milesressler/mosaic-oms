import { ActionIcon, Badge } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

interface ChatToggleProps {
  unreadCount?: number;
  onClick: () => void;
}

export default function ChatToggle({ unreadCount, onClick }: ChatToggleProps) {
  return (
    <ActionIcon
      size="lg"
      variant="filled"
      color="blue"
      radius="xl"
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 999,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <IconMessageCircle size={20} />
      {unreadCount && unreadCount > 0 && (
        <Badge
          size="sm"
          variant="filled"
          color="red"
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 18,
            height: 18,
            padding: 0,
            fontSize: 10,
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </ActionIcon>
  );
}
