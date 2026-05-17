// Notifications API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Notification, NotificationSettings, NotificationType } from '@sport-hub/shared';

export interface NotificationQueryParams {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const notificationsApi = {
  getNotifications: async (params?: NotificationQueryParams): Promise<{ data: Notification[]; unreadCount: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.notifications.list, { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.notifications.unread);
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markRead(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markAllRead);
  },

  getSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get(API_ENDPOINTS.notifications.settings);
    return response.data;
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await apiClient.patch(API_ENDPOINTS.notifications.settings, settings);
    return response.data;
  },
};
