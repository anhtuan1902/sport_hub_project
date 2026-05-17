// Chat API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Conversation, Message, MessageType } from '@sport-hub/shared';

export interface ConversationQueryParams {
  type?: string;
  page?: number;
  limit?: number;
}

export interface SendMessageRequest {
  content: string;
  messageType?: MessageType;
  replyToId?: string;
}

export const chatApi = {
  getConversations: async (params?: ConversationQueryParams): Promise<{ data: Conversation[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.chat.conversations, { params });
    return response.data;
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get(API_ENDPOINTS.chat.conversation(id));
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: Message[]; hasMore: boolean }> => {
    const response = await apiClient.get(API_ENDPOINTS.chat.messages(conversationId), {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post(API_ENDPOINTS.chat.messages(conversationId), data);
    return response.data;
  },

  createConversation: async (participantIds: string[], matchId?: string): Promise<Conversation> => {
    const response = await apiClient.post(API_ENDPOINTS.chat.createConversation, {
      participantIds,
      matchId,
    });
    return response.data;
  },
};
