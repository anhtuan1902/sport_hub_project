// Auth Store - User authentication state
import type { AuthResponse, User } from '@sport-hub/shared';
import { create } from 'zustand';
import { authApi, clearTokens, setTokens, usersApi } from '../api';
import { checkIsAuthenticated } from '../api/client';
import { LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const isAuthenticated = await checkIsAuthenticated();

      if (isAuthenticated) {
        const user = await usersApi.getMyProfile();
        set({ user: user as unknown as User, isAuthenticated: true, isInitialized: true });
      } else {
        set({ isAuthenticated: false, isInitialized: true });
      }
    } catch {
      set({ isAuthenticated: false, isInitialized: true });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response: AuthResponse = await authApi.login(data);
      await setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const response: AuthResponse = await authApi.register(data);
      await setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Continue logout even if API fails
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
