// Review Types

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

// Review Entity
export interface Review {
  id: string;
  userId: string;
  user?: any;
  courtId: string;
  court?: any;
  bookingId: string;
  rating: number;
  comment: string;
  images: string[];
  status: ReviewStatus;
  reply: ReviewReply | null;
  helpfulCount: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review Reply
export interface ReviewReply {
  id: string;
  reviewId: string;
  courtOwnerId: string;
  courtOwner?: any;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Review DTO
export interface CreateReviewDto {
  courtId: string;
  bookingId: string;
  rating: number;
  comment: string;
  images?: string[];
}

// Review Reply DTO
export interface CreateReviewReplyDto {
  reviewId: string;
  content: string;
}

// Review Query DTO
export interface ReviewQueryDto {
  courtId?: string;
  userId?: string;
  rating?: number;
  status?: ReviewStatus;
  page?: number;
  limit?: number;
}
