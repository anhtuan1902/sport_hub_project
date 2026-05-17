// Re-export shared types
export type {
  Booking,
  BookingStatus,
} from '@sport-hub/shared';

import type { BookingStatus } from '@sport-hub/shared';

// Mobile-specific booking types
export interface BookingSummary {
  id: string;
  bookingCode: string;
  courtName: string;
  courtAddress: string;
  coverImageUrl: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  finalPrice: number;
  status: BookingStatus;
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

export interface BookingQueryParams {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}
