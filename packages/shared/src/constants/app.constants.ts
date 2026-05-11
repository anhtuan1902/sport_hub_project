// Sports List
export const SPORTS = [
  { id: 1, name: 'Bóng đá 5', slug: 'football-5', icon: '⚽' },
  { id: 2, name: 'Bóng đá 7', slug: 'football-7', icon: '⚽' },
  { id: 3, name: 'Cầu lông', slug: 'badminton', icon: '🏸' },
  { id: 4, name: 'Tennis', slug: 'tennis', icon: '🎾' },
  { id: 5, name: 'Bóng rổ', slug: 'basketball', icon: '🏀' },
  { id: 6, name: 'Pickleball', slug: 'pickleball', icon: '🏓' },
  { id: 7, name: 'Bóng chuyền', slug: 'volleyball', icon: '🏐' },
] as const;

// Amenities List
export const AMENITIES = [
  { id: 1, name: 'Máy lạnh', slug: 'air_conditioner', icon: '❄️' },
  { id: 2, name: 'WiFi miễn phí', slug: 'wifi_free', icon: '📶' },
  { id: 3, name: 'Chỗ để xe', slug: 'parking', icon: '🅿️' },
  { id: 4, name: 'Phòng thay đồ', slug: 'changing_room', icon: '🚿' },
  { id: 5, name: 'Nước uống miễn phí', slug: 'water_free', icon: '💧' },
  { id: 6, name: 'Thuê vợt', slug: 'racket_rental', icon: '🏸' },
  { id: 7, name: 'Cafe', slug: 'cafe', icon: '☕' },
] as const;

// User Ranks
export const USER_RANKS = [
  { id: 1, name: 'Tân binh', slug: 'rookie', minMatches: 0, color: '#9CA3AF' },
  { id: 2, name: 'Nghiệp dư', slug: 'amateur', minMatches: 6, color: '#22C55E' },
  { id: 3, name: 'Chuyên nghiệp', slug: 'pro', minMatches: 21, color: '#3B82F6' },
  { id: 4, name: 'Cao thủ', slug: 'expert', minMatches: 51, color: '#F59E0B' },
  { id: 5, name: 'Huyền thoại', slug: 'legend', minMatches: 101, color: '#EF4444' },
] as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  REFUNDED: 'refunded',
} as const;

// Court Status
export const COURT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

// Match Status
export const MATCH_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  WALLET: 'wallet',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Default pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Default operating hours
export const DEFAULT_OPEN_TIME = '06:00';
export const DEFAULT_CLOSE_TIME = '22:00';
export const DEFAULT_SLOT_DURATION = 60; // minutes
