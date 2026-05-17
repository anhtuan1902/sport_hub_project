// Re-export shared types
export type {
  Conversation,
  ConversationType,
  ParticipantRole,
  Message,
  MessageType,
  ConversationParticipant,
  CreateConversationDto,
  SendMessageDto,
  ConversationQueryDto,
  MessageQueryDto,
} from '@sport-hub/shared';

import type { ConversationType, MessageType, ParticipantRole } from '@sport-hub/shared';

// Mobile-specific chat types
export interface ConversationSummary {
  id: string;
  type: ConversationType;
  title: string | null;
  isGroup: boolean;
  lastMessage?: {
    content: string;
    createdAt: Date;
    senderName: string;
  };
  unreadCount: number;
  participants: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  }[];
  updatedAt: Date;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: MessageType;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
