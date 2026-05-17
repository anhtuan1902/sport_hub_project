// Matches API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Match, CreateMatchDto, MatchQueryDto, MatchStatus } from '@sport-hub/shared';

export const matchesApi = {
  getMatches: async (params?: MatchQueryDto): Promise<{ data: Match[]; pagination: any }> => {
    const response = await apiClient.get(API_ENDPOINTS.matches.list, { params });
    return response.data;
  },

  discoverMatches: async (params?: Partial<MatchQueryDto>): Promise<{ data: Match[]; pagination: any }> => {
    const response = await apiClient.get(API_ENDPOINTS.matches.discover, { params });
    return response.data;
  },

  searchMatches: async (params?: MatchQueryDto): Promise<{ data: Match[]; pagination: any }> => {
    const response = await apiClient.get(API_ENDPOINTS.matches.search, { params });
    return response.data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const response = await apiClient.get(API_ENDPOINTS.matches.detail(id));
    return response.data;
  },

  createMatch: async (data: CreateMatchDto): Promise<Match> => {
    const response = await apiClient.post(API_ENDPOINTS.matches.create, data);
    return response.data;
  },

  updateMatch: async (id: string, data: Partial<CreateMatchDto>): Promise<Match> => {
    const response = await apiClient.patch(API_ENDPOINTS.matches.update(id), data);
    return response.data;
  },

  joinMatch: async (id: string): Promise<Match> => {
    const response = await apiClient.post(API_ENDPOINTS.matches.join(id));
    return response.data;
  },

  leaveMatch: async (id: string): Promise<Match> => {
    const response = await apiClient.post(API_ENDPOINTS.matches.leave(id));
    return response.data;
  },
};
