// Users API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { User, UserProfile, Gender } from '@sport-hub/shared';

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

export interface UserStats {
  totalBookings: number;
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  averageRating: number;
  totalReviews: number;
  rank: {
    level: string;
    points: number;
    badge: string;
  };
}

export const usersApi = {
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(API_ENDPOINTS.users.me);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch(API_ENDPOINTS.users.profile, data);
    return response.data;
  },

  getMyStats: async (): Promise<UserStats> => {
    const response = await apiClient.get(API_ENDPOINTS.users.stats);
    return response.data;
  },

  updateAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.users.updateAvatar, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
