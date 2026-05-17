// Payments API endpoints
import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { PaymentMethod, PaymentStatus } from '@sport-hub/shared';

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  paymentUrl: string | null;
  createdAt: Date;
}

export const paymentsApi = {
  createPayment: async (bookingId: string, method: PaymentMethod): Promise<{ paymentUrl: string; paymentId: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.payments.create, {
      bookingId,
      method,
    });
    return response.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(API_ENDPOINTS.payments.detail(id));
    return response.data;
  },

  vnpayReturn: async (params: Record<string, string>): Promise<Payment> => {
    const response = await apiClient.get(API_ENDPOINTS.payments.vnpayReturn, { params });
    return response.data;
  },
};
