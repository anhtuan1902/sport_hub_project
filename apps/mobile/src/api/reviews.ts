// Reviews API endpoints
import { API_ENDPOINTS } from '../constants/api';
import type { CreateReviewDto, Review } from '@sport-hub/shared';
import apiClient from './client';

export const reviewsApi = {
  // Create review
  createReview: async (data: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post(API_ENDPOINTS.reviews.create, data);
    return response.data;
  },

  // Get user reviews
  getUserReviews: async (userId: string, page = 1, limit = 10): Promise<{ data: Review[]; total: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.reviews.user(userId), {
      params: { page, limit },
    });
    return response.data;
  },
};
