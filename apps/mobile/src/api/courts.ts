// Courts API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Court, CourtQueryDto, Sport } from '@sport-hub/shared';

export interface CourtSearchResponse {
  data: Court[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const courtsApi = {
  getCourts: async (params?: CourtQueryDto): Promise<CourtSearchResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.courts.list, { params });
    return response.data;
  },

  searchCourts: async (params?: CourtQueryDto): Promise<CourtSearchResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.courts.search, { params });
    return response.data;
  },

  getCourtById: async (id: string): Promise<Court> => {
    const response = await apiClient.get(API_ENDPOINTS.courts.detail(id));
    return response.data;
  },

  getCourtAvailability: async (id: string, date: string) => {
    const response = await apiClient.get(API_ENDPOINTS.courts.availability(id), {
      params: { date },
    });
    return response.data;
  },

  getCourtReviews: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get(API_ENDPOINTS.courts.reviews(id), {
      params: { page, limit },
    });
    return response.data;
  },

  getSports: async (): Promise<Sport[]> => {
    const response = await apiClient.get(API_ENDPOINTS.sports.list);
    return response.data;
  },
};
