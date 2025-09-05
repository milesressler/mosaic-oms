import { Box, Flex, Stack, Text } from '@mantine/core';
import { memo } from 'react';
import { DateTime } from 'luxon';
import { ChatMessageResponse } from 'src/models/chat';
import { AssigneeAvatar } from 'src/components/orders/AssigneeAvatar';
import { useMessageGrouping } from 'src/hooks/useMessageGrouping';
import OrderPreview from './OrderPreview';

interface MessageBubbleProps {
  message: ChatMessageResponse;
  isOwnMessage: boolean;
  messages: ChatMessageResponse[];
  index: number;
  isGlobalChat: boolean;
  currentUserExternalId?: string;
}

const MessageBubble = memo(function MessageBubble({
  message,
  isOwnMessage,
  messages,
  index,
  isGlobalChat,
  currentUserExternalId
}: MessageBubbleProps) {
  
  const { isGrouped, showTimestamp, showSenderName } = useMessageGrouping(
    messages,
    index,
    isGlobalChat,
    currentUserExternalId
  );
  
  const formatTime = (timestamp: string): string => {
    return DateTime.fromISO(timestamp).toFormat('h:mm a');
  };

  return (
    <Box
      mt={!isGrouped ? "xs" : 2}
      style={{ width: '100%' }}
    >
      <Flex
        direction="row"
        gap="xs"
        align="flex-start"
        w="100%"
      >
        {/* Avatar area - always present for consistent spacing */}
        {!isOwnMessage && (
          <Box style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            {!isGrouped && <AssigneeAvatar assigned={message.sender} />}
          </Box>
        )}
        
        {/* Message content area */}
        <Flex 
          direction="column" 
          style={{ 
            flex: 1, 
            minWidth: 0,
            alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
          }}
        >
          {/* Show sender name if specified (global chat) */}
          {showSenderName && (
            <Text size="xs" fw={600} mb={2} c="dimmed" style={{ alignSelf: 'flex-start' }}>
              {message.sender.name}
            </Text>
          )}
          
          {/* Message bubble */}
          <Box
            style={{
              maxWidth: '75%',
              background: isOwnMessage ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-1)',
              color: isOwnMessage ? 'white' : 'inherit',
              borderRadius: '8px',
              padding: '4px 8px',
              wordBreak: 'break-word'
            }}
          >
            <Text size="sm">
              {message.content}
            </Text>
          </Box>
          
          {/* Order references */}
          {message.orderDetails && message.orderDetails.length > 0 && (
            <Stack gap="xs" mt="xs" style={{ alignSelf: isOwnMessage ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              {message.orderDetails.map(order => (
                <OrderPreview key={order.id} order={order} />
              ))}
            </Stack>
          )}
        </Flex>
        
        {/* Own message avatar area - for symmetry */}
        {isOwnMessage && (
          <Box style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            {!isGrouped && <AssigneeAvatar assigned={message.sender} />}
          </Box>
        )}
      </Flex>
      
      {/* Timestamp - always right aligned */}
      {showTimestamp && (
        <Flex justify="flex-end" mt="2px">
          <Text size="xs" c="dimmed">
            {formatTime(message.createdAt)}
          </Text>
        </Flex>
      )}
    </Box>
  );
});

export default MessageBubble;