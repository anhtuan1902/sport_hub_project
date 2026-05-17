// Notification Store - Unread notification count
import { create } from 'zustand';
import { notificationsApi } from '../api';

interface NotificationState {
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchUnreadCount: () => Promise<void>;
  increment: () => void;
  decrement: (amount?: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  isLoading: false,

  fetchUnreadCount: async () => {
    set({ isLoading: true });
    try {
      const { count } = await notificationsApi.getUnreadCount();
      set({ unreadCount: count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  increment: () => {
    const { unreadCount } = get();
    set({ unreadCount: unreadCount + 1 });
  },

  decrement: (amount = 1) => {
    const { unreadCount } = get();
    set({ unreadCount: Math.max(0, unreadCount - amount) });
  },

  reset: () => {
    set({ unreadCount: 0 });
  },
}));
