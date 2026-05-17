import { Gender } from '@sport-hub/shared';

// Re-export shared types
export type {
  AuthProvider, Gender, User, UserProfile, UserRole,
  UserStatus
} from '@sport-hub/shared';


// Mobile-specific user types
export interface UserStats {
  totalBookings: number;
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  averageRating: number;
  totalReviews: number;
  rank: {
    level: string;
    points: number;
    badge: string;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatarUrl?: string;
}

export interface UserSearchParams {
  query?: string;
  sportId?: number;
  skillLevel?: string;
  province?: string;
  district?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface UserPublicProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  totalMatches: number;
  totalBookings: number;
  rank: {
    level: string;
    points: number;
    badge: string;
  };
  createdAt: Date;
}
