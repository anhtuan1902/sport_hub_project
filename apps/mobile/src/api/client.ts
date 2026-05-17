// API Client - Axios instance with interceptors
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

// DEBUG: Log API URL
console.log('[API Client] Base URL:', API_BASE_URL);

// Storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getItemAsync(ACCESS_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getItemAsync(REFRESH_TOKEN_KEY);

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await setItemAsync(ACCESS_TOKEN_KEY, accessToken);
          await setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const setTokens = async (accessToken: string, refreshToken: string) => {
  await setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async () => {
  await deleteItemAsync(ACCESS_TOKEN_KEY);
  await deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const getAccessToken = async () => {
  return await getItemAsync(ACCESS_TOKEN_KEY);
};

export const checkIsAuthenticated = async () => {
  const token = await getAccessToken();
  return !!token;
};

export default apiClient;
