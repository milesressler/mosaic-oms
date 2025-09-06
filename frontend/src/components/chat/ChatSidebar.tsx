import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconMessageCircle, IconX, IconUsers, IconSearch } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import chatApi from 'src/services/chatApi';
import { ChatMessageResponse, ChatParticipant } from 'src/models/chat';
import OrderTaggingTip from './OrderTaggingTip';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ParticipantList from './ParticipantList';
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
  const [participantSearch, setParticipantSearch] = useState('');
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

  const renderMessage = (message: ChatMessageResponse, index: number) => {
    const isOwnMessage = message.sender.externalId === user?.sub;
    
    return (
      <MessageBubble
        key={message.id}
        message={message}
        isOwnMessage={isOwnMessage}
        messages={messages}
        index={index}
        isGlobalChat={activeTab === 'global'}
        currentUserExternalId={user?.sub}
      />
    );
  };

  const handleSelectParticipant = (participant: ChatParticipant) => {
    setSelectedParticipant(participant);
    // Clear unread count when selecting participant
    setParticipantUnreadCount(prev => ({
      ...prev,
      [participant.externalId]: 0
    }));
  };

  // Filter participants based on search
  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(participantSearch.toLowerCase())
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
        <Flex direction="column" style={{ flex: 1, minHeight: 0 }}>
          <Text size="sm" c="dimmed" mb="sm">
            Select someone to message:
          </Text>
          
          {/* Search Input */}
          <TextInput
            placeholder="Search participants..."
            value={participantSearch}
            onChange={(e) => setParticipantSearch(e.target.value)}
            leftSection={<IconSearch size={16} />}
            mb="sm"
            style={{ flexShrink: 0 }}
          />
          
          {/* Participant List with Scroll */}
          <ScrollArea style={{ flex: 1, minHeight: 0 }} offsetScrollbars>
            {filteredParticipants.length > 0 ? (
              <ParticipantList
                participants={filteredParticipants}
                selectedParticipant={selectedParticipant}
                participantUnreadCount={participantUnreadCount}
                onSelectParticipant={handleSelectParticipant}
              />
            ) : (
              <Stack align="center" justify="center" p="xl" style={{ height: '200px' }}>
                <Text size="sm" c="dimmed" ta="center">
                  {participantSearch ? 
                    `No participants found matching "${participantSearch}"` :
                    "No previous conversations. Start chatting in Global to connect with others!"
                  }
                </Text>
              </Stack>
            )}
          </ScrollArea>
          
          {/* Show count */}
          <Text size="xs" c="dimmed" mt="xs" style={{ flexShrink: 0 }}>
            Showing {filteredParticipants.length} of {participants.length} participants
          </Text>
        </Flex>
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
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={sendMessage}
              placeholder="Type a message..."
            />
          </Box>
        </Flex>
      )}
    </Paper>
  );
}
