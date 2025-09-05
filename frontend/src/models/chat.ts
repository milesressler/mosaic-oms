import { BasicUser, OrderDetails } from './types';

export interface ChatMessageRequest {
  content: string;
  recipientId?: string;
}

export interface ChatMessageResponse {
  id: string;
  uuid: string;
  sender: BasicUser;
  recipient?: BasicUser;
  content: string;
  messageType: 'TEXT' | 'ORDER_REFERENCE' | 'SYSTEM';
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  isDirectMessage: boolean;
  orderReferences: string[];
  orderDetails?: OrderDetails[];
}

export interface ChatNotification {
  message: ChatMessageResponse;
  senderExtId: string;
  senderName: string;
}

export interface ChatParticipant extends BasicUser {
  lastMessageContent?: string;
  lastMessageTime?: string;
  lastMessageFromMe?: boolean;
  unreadCount?: number;
  isOnline?: boolean;
}