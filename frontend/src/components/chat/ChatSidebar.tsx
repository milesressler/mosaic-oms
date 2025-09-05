import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import { IconMessageCircle, IconSend, IconX, IconUsers } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import chatApi from 'src/services/chatApi';
import { ChatMessageResponse } from 'src/models/chat';
import {AssigneeAvatar} from 'src/components/orders/AssigneeAvatar';
import { DateTime } from 'luxon';
import OrderPreview from './OrderPreview';
import OrderTaggingTip from './OrderTaggingTip';
import { useChat } from 'src/context/ChatContext';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function
    ChatSidebar({ isOpen, onClose, embedded = false }: ChatSidebarProps) {
  const { user } = useAuth0();
  const chat = useChat();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Use chat context state
  const {
    messages,
    setMessages,
    participants,
    setParticipants,
    activeTab,
    setActiveTab,
    selectedParticipant,
    setSelectedParticipant,
    participantUnreadCount,
    setParticipantUnreadCount
  } = chat;

  // Load initial messages
  useEffect(() => {
    if (isOpen) {
      void loadMessages();
      if (activeTab === 'dm') {
        void loadParticipants();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, selectedParticipant]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async (): Promise<void> => {
    try {
      if (activeTab === 'global') {
        const response = await chatApi.getGlobalMessages({ size: 50 });
        setMessages(response.data.content?.reverse() || []);
      } else if (selectedParticipant) {
        const response = await chatApi.getDirectMessages(selectedParticipant.uuid, { size: 50 });
        setMessages(response.data.content?.reverse() || []);
      }
    } catch (error: unknown) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadParticipants = async (): Promise<void> => {
    try {
      const response = await chatApi.getDirectMessageParticipants();
      setParticipants(response.data);
    } catch (error: unknown) {
      console.error('Failed to load participants:', error);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage(''); // Clear immediately for better UX

    // Add optimistic update FIRST - before API call
    const optimisticMessage: ChatMessageResponse = {
      id: String(Date.now()), // Temporary ID - convert to string
      uuid: 'temp-' + Date.now(),
      sender: {
        uuid: user?.sub || '',
        externalId: user?.sub || '',
        name: user?.name || '',
        avatar: user?.picture || ''
      },
      recipient: activeTab === 'dm' && selectedParticipant ? selectedParticipant : undefined,
      content: messageContent,
      messageType: messageContent.match(/#\d+/) ? 'ORDER_REFERENCE' : 'TEXT',
      createdAt: new Date().toISOString(),
      isEdited: false,
      editedAt: undefined,
      isDirectMessage: activeTab === 'dm',
      orderReferences: messageContent.match(/#(\d+)/g)?.map(m => m.slice(1)) || []
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await chatApi.sendMessage({
        content: messageContent,
        recipientId: activeTab === 'dm' ? selectedParticipant?.uuid : undefined,
      });
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on error
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.uuid !== optimisticMessage.uuid));
    }
  };

  // WebSocket subscriptions are now handled by ChatContext

  const shouldGroupWithPrevious = (currentMessage: ChatMessageResponse, prevMessage: ChatMessageResponse | undefined): boolean => {
    if (!prevMessage) return false;
    
    const isSameSender = currentMessage.sender.externalId === prevMessage.sender.externalId;
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const prevTime = new Date(prevMessage.createdAt).getTime();
    const timeDiff = currentTime - prevTime;
    const withinGroupingWindow = timeDiff < 5 * 60 * 1000; // 5 minutes
    
    return isSameSender && withinGroupingWindow;
  };

  const shouldShowTimestamp = (currentMessage: ChatMessageResponse, nextMessage: ChatMessageResponse | undefined): boolean => {
    if (!nextMessage) return true; // Always show on last message
    return !shouldGroupWithPrevious(nextMessage, currentMessage);
  };

  const formatTime = (timestamp: string): string => {
    return DateTime.fromISO(timestamp).toFormat('h:mm a');
  };

  const renderMessage = (message: ChatMessageResponse, index: number) => {
    const isOwnMessage = message.sender.externalId === user?.sub;
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined;
    const isGrouped = shouldGroupWithPrevious(message, prevMessage);
    const showTimestamp = shouldShowTimestamp(message, nextMessage);
    
    return (
      <Box
        key={message.id}
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
            {/* Show name only on first message of group in global chat */}
            {!isOwnMessage && activeTab === 'global' && !isGrouped && (
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
          
          {/* Your message avatar area - for symmetry */}
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
  };

  const renderParticipantList = () => (
    <Stack gap="xs">
      {participants.map(participant => {
        const unreadCount = participantUnreadCount[participant.externalId] || 0;
        return (
          <UnstyledButton
            key={participant.uuid}
            p="xs"
            bg={selectedParticipant?.uuid === participant.uuid ? 'blue.0' : undefined}
            onClick={() => {
              setSelectedParticipant(participant);
              // Clear unread count when selecting participant
              setParticipantUnreadCount(prev => ({
                ...prev,
                [participant.externalId]: 0
              }));
            }}
            w="100%"
          >
            <Group justify="space-between" align="flex-start">
              <Group gap="sm" align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                <Box style={{ position: 'relative' }}>
                  <AssigneeAvatar assigned={participant} />
                  {participant.isOnline && (
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        backgroundColor: 'var(--mantine-color-green-5)',
                        border: '2px solid white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  )}
                </Box>
                <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500}>{participant.name}</Text>
                  {participant.lastMessageContent && (
                    <Text size="xs" c="dimmed" truncate style={{ maxWidth: '200px' }}>
                      {participant.lastMessageFromMe ? 'You: ' : ''}
                      {participant.lastMessageContent}
                    </Text>
                  )}
                </Flex>
              </Group>
              {unreadCount > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="red"
                  style={{
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );

  if (!isOpen) return null;

  const containerStyle = embedded 
    ? { 
        display: 'flex', 
        flexDirection: 'column' as const, 
        height: '100%',
        minHeight: 0,
        flex: 1
      }
    : {
        position: 'fixed' as const,
        right: 16,
        bottom: 16,
        width: 400,
        height: 600,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column' as const,
      };

  return (
    <Paper
      shadow={embedded ? undefined : "lg"}
      radius={embedded ? undefined : "lg"}
      p={embedded ? 0 : "md"}
      style={containerStyle}
    >
      {/* Header - only show for floating mode */}
      {!embedded && (
        <Group justify="space-between" mb="md">
          <Group>
            <IconMessageCircle size={20} />
            <Text fw={600}>Chat</Text>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose}>
            <IconX size={16} />
          </ActionIcon>
        </Group>
      )}

      {/* Tabs */}
      <Group mb="md" grow>
        <Button
          variant={activeTab === 'global' ? 'filled' : 'light'}
          size="sm"
          leftSection={<IconUsers size={16} />}
          onClick={() => setActiveTab('global')}
        >
          Global
        </Button>
        <Button
          variant={activeTab === 'dm' ? 'filled' : 'light'}
          size="sm"
          leftSection={<IconMessageCircle size={16} />}
          onClick={() => setActiveTab('dm')}
        >
          Direct
        </Button>
      </Group>

      {/* Order Tagging Tip */}
      <OrderTaggingTip />

      {/* DM Participant Selection */}
      {activeTab === 'dm' && !selectedParticipant && (
        <Box style={{ flex: 1 }}>
          <Text size="sm" c="dimmed" mb="md">
            Select someone to message:
          </Text>
          <ScrollArea style={{ height: '100%' }}>
            {renderParticipantList()}
          </ScrollArea>
        </Box>
      )}

      {/* Messages Area */}
      {(activeTab === 'global' || selectedParticipant) && (
        <Flex direction="column" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {activeTab === 'dm' && selectedParticipant && (
            <Group mb="sm" style={{ flexShrink: 0 }}>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setSelectedParticipant(null)}
              >
                ← Back
              </Button>
              <Text size="sm" fw={600}>
                {selectedParticipant.name}
              </Text>
            </Group>
          )}

          <ScrollArea
            style={{ flex: 1, minHeight: 0 }}
            viewportRef={scrollAreaRef}
          >
            <Stack gap={0} p="xs">
              {messages.map((message, index) => renderMessage(message, index))}
            </Stack>
          </ScrollArea>

          <Box style={{ flexShrink: 0 }}>
            <Divider my="sm" />
            
            {/* Message Input - Always at bottom */}
            <Group gap="xs">
              <Textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                autosize
                size={'lg'}
                minRows={1}
                maxRows={3}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="filled"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <IconSend size={16} />
              </ActionIcon>
            </Group>
          </Box>
        </Flex>
      )}
    </Paper>
  );
}
