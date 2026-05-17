// Re-export shared types
export type {
  Review,
  ReviewStatus,
  ReviewReply,
  CreateReviewDto,
  ReviewQueryDto,
  CreateReviewReplyDto,
} from '@sport-hub/shared';

import type { ReviewStatus } from '@sport-hub/shared';

// Mobile-specific review types
export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  courtId: string;
  courtName: string;
  rating: number;
  comment: string;
  images: string[];
  status: ReviewStatus;
  reply?: {
    content: string;
    createdAt: Date;
  };
  createdAt: Date;
}

export interface CreateReviewFormData {
  courtId: string;
  bookingId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
