// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Search Params
export interface SearchParams extends PaginationParams {
  query?: string;
  sportId?: number;
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

// Date Range
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

// Time Slot
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

// Error Response
export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

// Success Response Helper
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// Paginated Response Helper
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    message,
  };
}
