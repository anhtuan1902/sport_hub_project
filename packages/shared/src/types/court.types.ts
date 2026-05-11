// Court Status
export enum CourtStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Sport
export interface Sport {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
  courtCount?: number;
}

// Amenity
export interface Amenity {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  category?: string;
}

// Court Image
export interface CourtImage {
  id: string;
  url: string;
  caption?: string;
  type: 'gallery' | 'thumbnail' | '360' | 'video';
  sortOrder?: number;
}

// Court Entity
export interface Court {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  basePrice: number;
  priceUnit: string;
  weekendPrice?: number;
  peakHourPrice?: number;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  coverImageUrl?: string;
  status: CourtStatus;
  isFeatured: boolean;
  isVerified: boolean;
  amenities?: Amenity[];
  sports?: Sport[];
  images?: CourtImage[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Court DTO
export interface CreateCourtDto {
  name: string;
  description?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  basePrice: number;
  priceUnit?: string;
  weekendPrice?: number;
  peakHourPrice?: number;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
  amenities?: number[];
  sports?: number[];
}

// Court Query DTO
export interface CourtQueryDto {
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
}

// Booking Status
export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded',
}

// Booking Entity
export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  courtId: string;
  sportId?: number;
  ownerId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  totalPaid: number;
  status: BookingStatus;
  qrCode?: string;
  playerName?: string;
  playerPhone?: string;
  playerCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
