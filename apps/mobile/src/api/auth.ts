// Auth API endpoints
import type { AuthResponse } from '@sport-hub/shared';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from './client';
import { ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../types';


export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, data);
    console.log('login response', response.data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.register, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.changePassword, data);
  },
};
