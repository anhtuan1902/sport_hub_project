// Chat Types

export enum ConversationType {
  DIRECT = 'direct',
  MATCH = 'match',
  COURT = 'court',
  SUPPORT = 'support',
}

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  LOCATION = 'location',
  CONTACT = 'contact',
}

// Conversation Entity
export interface Conversation {
  id: string;
  type: ConversationType;
  courtId: string | null;
  court?: any;
  title: string | null;
  isGroup: boolean;
  lastMessageId: string | null;
  lastMessage?: Message | null;
  lastMessageAt: Date | null;
  createdBy: string;
  creator?: any;
  participants?: ConversationParticipant[];
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Conversation Participant
export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user?: any;
  role: ParticipantRole;
  unreadCount: number;
  lastReadAt: Date | null;
  joinedAt: Date;
}

// Message Entity
export interface Message {
  id: string;
  conversationId: string;
  conversation?: Conversation;
  senderId: string;
  sender?: any;
  content: string;
  messageType: MessageType;
  metadata: Record<string, any> | null;
  replyToId: string | null;
  replyTo?: Message | null;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Create Conversation DTO
export interface CreateConversationDto {
  type: ConversationType;
  participantIds: string[];
  title?: string;
  courtId?: string;
  matchId?: string;
}

// Send Message DTO
export interface SendMessageDto {
  content: string;
  messageType?: MessageType;
  metadata?: Record<string, any>;
  replyToId?: string;
}

// Conversation Query DTO
export interface ConversationQueryDto {
  type?: ConversationType;
  withMessages?: boolean;
  page?: number;
  limit?: number;
}

// Message Query DTO
export interface MessageQueryDto {
  before?: string;
  after?: string;
  limit?: number;
}
