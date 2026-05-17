// Sports API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import { Sport } from '@sport-hub/shared';

export const sportsApi = {
  // Get all sports
  getSports: async (): Promise<Sport[]> => {
    const response = await apiClient.get(API_ENDPOINTS.sports.list);
    return response.data;
  },

  // Get sport by ID
  getSportById: async (id: string): Promise<Sport> => {
    const response = await apiClient.get(API_ENDPOINTS.sports.detail(id));
    return response.data;
  },
};
