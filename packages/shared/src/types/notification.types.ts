// Notification Types

export enum NotificationType {
  // Booking notifications
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_COMPLETED = 'booking_completed',
  
  // Payment notifications
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_INITIATED = 'refund_initiated',
  REFUND_COMPLETED = 'refund_completed',
  
  // Match notifications
  MATCH_CREATED = 'match_created',
  MATCH_JOIN_REQUEST = 'match_join_request',
  MATCH_JOINED = 'match_joined',
  MATCH_LEFT = 'match_left',
  MATCH_STARTED = 'match_started',
  MATCH_COMPLETED = 'match_completed',
  MATCH_CANCELLED = 'match_cancelled',
  MATCH_REMINDER = 'match_reminder',
  
  // Chat notifications
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  
  // Review notifications
  REVIEW_RECEIVED = 'review_received',
  REVIEW_REPLY = 'review_reply',
  
  // System notifications
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ACCOUNT_UPDATE = 'account_update',
  SECURITY_ALERT = 'security_alert',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
}

// Notification Entity
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl: string | null;
  actionUrl: string | null;
  data: Record<string, any>;
  isRead: boolean;
  readAt: Date | null;
  channels: NotificationChannel[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Notification DTO
export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
}

// Notification Settings
export interface NotificationSettings {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  types: Record<NotificationType, boolean>;
}

// Notification Query DTO
export interface NotificationQueryDto {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
