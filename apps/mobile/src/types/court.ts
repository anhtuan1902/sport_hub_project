import { Court, Sport } from '@sport-hub/shared';

// Mobile-specific court types
export interface CourtSummary {
  id: string;
  name: string;
  address: string;
  coverImageUrl?: string;
  avgRating: number;
  basePrice: number;
  sports?: Sport[];
}

export interface CourtSearchParams {
  query?: string;
  sportId?: number;
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string;
  sort?: 'price' | 'rating' | 'distance' | 'createdAt';
  order?: 'ASC' | 'DESC';
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface CourtSearchResponse {
  data: Court[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CourtOwner {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
}
