import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useSubscription } from 'react-stomp-hooks';
import { useAuth0 } from '@auth0/auth0-react';
import { ChatMessageResponse, ChatNotification, ChatParticipant } from 'src/models/chat';

interface ChatContextType {
  // Messages
  messages: ChatMessageResponse[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
  
  // Participants
  participants: ChatParticipant[];
  setParticipants: React.Dispatch<React.SetStateAction<ChatParticipant[]>>;
  
  // Unread counts
  globalUnreadCount: number;
  dmUnreadCount: number;
  participantUnreadCount: Record<string, number>;
  setParticipantUnreadCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  
  // Chat state
  activeTab: 'global' | 'dm';
  setActiveTab: React.Dispatch<React.SetStateAction<'global' | 'dm'>>;
  selectedParticipant: ChatParticipant | null;
  setSelectedParticipant: React.Dispatch<React.SetStateAction<ChatParticipant | null>>;
  
  // Chat actions
  clearUnreadCounts: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  isOpen: boolean; // Whether chat UI is currently visible
}

export function ChatProvider({ children, isOpen }: ChatProviderProps) {
  const { user } = useAuth0();
  
  // Type guard for user validation
  const isValidUser = user && user.sub;
  
  console.log('ChatProvider render - isOpen:', isOpen, 'hasValidUser:', !!isValidUser);
  
  // Messages and participants
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  
  // Unread counts
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [participantUnreadCount, setParticipantUnreadCount] = useState<Record<string, number>>({});
  
  // Chat state
  const [activeTab, setActiveTab] = useState<'global' | 'dm'>('global');
  const [selectedParticipant, setSelectedParticipant] = useState<ChatParticipant | null>(null);

  // Clear unread counts when chat is opened - memoized to prevent re-renders
  const clearUnreadCounts = useCallback(() => {
    setGlobalUnreadCount(0);
    setDmUnreadCount(0);
  }, []);

  // Clear unread counts when chat becomes visible
  useEffect(() => {
    if (isOpen) {
      clearUnreadCounts();
    }
  }, [isOpen]);

  // WebSocket subscription for global messages - only if user is valid
  useSubscription('/topic/chat/global', (message) => {
    if (!isValidUser) return;
    
    try {
      const notification: ChatNotification = JSON.parse(message.body);
      console.log('ChatContext Global WebSocket message received:', notification.message.id, notification.message.content);
      
      // Validate notification structure
      if (!notification.message || !notification.message.id || !notification.message.sender?.externalId) {
        console.error('Invalid message structure:', notification);
        return;
      }
      
      // Update messages if on global tab
      if (activeTab === 'global') {
        setMessages(prev => {
          // Check if this message already exists (avoid duplicates)
          if (prev.some(m => m.id === notification.message.id)) {
            console.log('Duplicate global message ignored:', notification.message.id);
            return prev;
          }
          
          // If this is our own message, merge with or replace any temp messages
          if (notification.message.sender.externalId === user.sub) {
            const messageTime = new Date(notification.message.createdAt).getTime();
            const filtered = prev.filter(m => {
              // Keep all non-temp messages
              if (!m.uuid.startsWith('temp-')) return true;
              
              // Remove temp messages that match this real message (content + timing)
              const tempTime = new Date(m.createdAt).getTime();
              const timeDiff = Math.abs(messageTime - tempTime);
              const contentMatches = m.content === notification.message.content;
              const timeMatches = timeDiff < 10000; // Within 10 seconds
              
              if (contentMatches && timeMatches) {
                console.log('Replacing temp message with WebSocket message:', m.uuid);
                return false;
              }
              return true;
            });
            return [...filtered, notification.message];
          } else {
            // For messages from others, just add if not duplicate
            return [...prev, notification.message];
          }
        });
      }
      
      // Update unread count if chat is closed and not our message
      if (!isOpen && notification.message.sender.externalId !== user.sub) {
        console.log('ChatContext: Incrementing global unread count');
        setGlobalUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error processing global WebSocket message:', error);
    }
  });

  // WebSocket subscription for direct messages
  useSubscription(`/topic/chat/dm/${user?.sub}`, (message) => {
    const notification: ChatNotification = JSON.parse(message.body);
    const isFromOtherUser = notification.message.sender.externalId !== user?.sub;
    console.log('ChatContext DM WebSocket message received:', notification.message.id, notification.message.content, 'isDirectMessage:', notification.message.isDirectMessage);
    
    // Only process messages that are actually direct messages
    if (!notification.message.isDirectMessage) {
      console.log('Ignoring non-DM message in DM subscription:', notification.message.id);
      return;
    }
    
    if (activeTab === 'dm' && selectedParticipant && 
        (notification.message.sender.externalId === selectedParticipant.externalId || 
         notification.message.recipient?.externalId === selectedParticipant.externalId)) {
      // Currently viewing this conversation - add message to current view
      setMessages(prev => {
        // Check if this message already exists (avoid duplicates)
        if (prev.some(m => m.id === notification.message.id)) {
          return prev;
        }
        
        // If this is our own message, remove any temp messages with similar content and timestamp
        if (notification.message.sender.externalId === user?.sub) {
          const messageTime = new Date(notification.message.createdAt).getTime();
          const filtered = prev.filter(m => {
            // Keep all non-temp messages and temp messages that don't match
            if (!m.uuid.startsWith('temp-')) return true;
            
            // Remove temp messages that are ours and have similar content/timing (within 10 seconds)
            const tempTime = new Date(m.createdAt).getTime();
            const timeDiff = Math.abs(messageTime - tempTime);
            const contentMatches = m.content === notification.message.content;
            const timeMatches = timeDiff < 10000; // Within 10 seconds
            
            return !(contentMatches && timeMatches);
          });
          return [...filtered, notification.message];
        } else {
          // For messages from others, just add if not duplicate
          return [...prev, notification.message];
        }
      });
    } else if (isFromOtherUser) {
      // Message from someone else not currently viewing - increment unread count
      const senderExternalId = notification.message.sender.externalId;
      
      // Update total DM unread count if chat is closed
      if (!isOpen) {
        console.log('ChatContext: Incrementing DM unread count');
        setDmUnreadCount(prev => prev + 1);
      }
      
      // Update per-participant unread count
      setParticipantUnreadCount(prev => ({
        ...prev,
        [senderExternalId]: (prev[senderExternalId] || 0) + 1
      }));
    }
  });

  // WebSocket subscription for user status changes
  useSubscription('/topic/user-status', (message) => {
    const statusChange = JSON.parse(message.body);
    
    // Update participant online status
    setParticipants(prev => prev.map(participant => 
      participant.externalId === statusChange.externalId 
        ? { ...participant, isOnline: statusChange.isOnline }
        : participant
    ));
  });

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: ChatContextType = useMemo(() => ({
    messages,
    setMessages,
    participants,
    setParticipants,
    globalUnreadCount,
    dmUnreadCount,
    participantUnreadCount,
    setParticipantUnreadCount,
    activeTab,
    setActiveTab,
    selectedParticipant,
    setSelectedParticipant,
    clearUnreadCounts,
  }), [
    messages,
    participants,
    globalUnreadCount,
    dmUnreadCount,
    participantUnreadCount,
    activeTab,
    selectedParticipant,
    clearUnreadCounts
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}