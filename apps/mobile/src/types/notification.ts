// Re-export shared types
export type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationSettings,
  CreateNotificationDto,
  NotificationQueryDto,
} from '@sport-hub/shared';

import type { NotificationType } from '@sport-hub/shared';

// Mobile-specific notification types
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationGroup {
  title: string;
  data: NotificationItem[];
}

export interface UnreadCountResponse {
  count: number;
}
