// Bookings API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Booking, BookingStatus } from '@sport-hub/shared';

export interface BookingQueryParams {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateBookingRequest {
  courtId: string;
  sportId?: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  playerName?: string;
  playerPhone?: string;
  playerCount?: number;
  notes?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export const bookingsApi = {
  getMyBookings: async (params?: BookingQueryParams): Promise<{ data: Booking[]; pagination: any }> => {
    const response = await apiClient.get(API_ENDPOINTS.bookings.my, { params });
    return response.data;
  },

  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post(API_ENDPOINTS.bookings.create, data);
    return response.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(API_ENDPOINTS.bookings.detail(id));
    return response.data;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch(API_ENDPOINTS.bookings.cancel(id));
    return response.data;
  },

  getAvailability: async (courtId: string, date: string): Promise<{ slots: TimeSlot[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.bookings.availability, {
      params: { courtId, date },
    });
    return response.data;
  },
};
