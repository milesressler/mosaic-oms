import { ActionIcon, Group, Textarea } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { memo } from 'react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = memo(function MessageInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled = false
}: MessageInputProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <Group gap="xs">
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autosize
        size="lg"
        minRows={1}
        maxRows={3}
        style={{ flex: 1 }}
        disabled={disabled}
      />
      <ActionIcon
        variant="filled"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
      >
        <IconSend size={16} />
      </ActionIcon>
    </Group>
  );
});

export default MessageInput;