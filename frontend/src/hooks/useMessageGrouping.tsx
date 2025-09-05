import { useMemo } from 'react';
import { ChatMessageResponse } from 'src/models/chat';

interface MessageGrouping {
  isGrouped: boolean;
  showTimestamp: boolean;
  showSenderName: boolean;
}

export function useMessageGrouping(
  messages: ChatMessageResponse[],
  currentIndex: number,
  isGlobalChat: boolean,
  currentUserExternalId?: string
): MessageGrouping {
  
  return useMemo(() => {
    const currentMessage = messages[currentIndex];
    const prevMessage = currentIndex > 0 ? messages[currentIndex - 1] : undefined;
    const nextMessage = currentIndex < messages.length - 1 ? messages[currentIndex + 1] : undefined;
    
    const shouldGroupWithPrevious = (current: ChatMessageResponse, prev: ChatMessageResponse | undefined): boolean => {
      if (!prev) return false;
      
      const isSameSender = current.sender.externalId === prev.sender.externalId;
      const currentTime = new Date(current.createdAt).getTime();
      const prevTime = new Date(prev.createdAt).getTime();
      const timeDiff = currentTime - prevTime;
      const withinGroupingWindow = timeDiff < 5 * 60 * 1000; // 5 minutes
      
      return isSameSender && withinGroupingWindow;
    };
    
    const shouldShowTimestamp = (current: ChatMessageResponse, next: ChatMessageResponse | undefined): boolean => {
      if (!next) return true; // Always show on last message
      return !shouldGroupWithPrevious(next, current);
    };
    
    const isGrouped = shouldGroupWithPrevious(currentMessage, prevMessage);
    const showTimestamp = shouldShowTimestamp(currentMessage, nextMessage);
    
    // Show sender name in global chat for first message of group from others
    const isOwnMessage = currentMessage.sender.externalId === currentUserExternalId;
    const showSenderName = !isOwnMessage && isGlobalChat && !isGrouped;
    
    return {
      isGrouped,
      showTimestamp,
      showSenderName
    };
  }, [messages, currentIndex, isGlobalChat, currentUserExternalId]);
}