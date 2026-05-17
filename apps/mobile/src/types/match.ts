// Re-export shared types
export type {
  Match,
  MatchStatus,
  SkillLevel,
  GenderRestrict,
  MatchPlayer,
  MatchMessage,
  CreateMatchDto,
  MatchQueryDto,
} from '@sport-hub/shared';

import type { MatchStatus, SkillLevel, GenderRestrict } from '@sport-hub/shared';

// Mobile-specific match types
export interface MatchSummary {
  id: string;
  title: string;
  sportName: string;
  sportIcon?: string;
  locationName: string;
  matchDate: Date;
  startTime: string;
  currentPlayers: number;
  maxPlayers: number;
  costPerPerson: number;
  isFree: boolean;
  skillLevel: SkillLevel;
  status: MatchStatus;
  creatorName: string;
  creatorAvatar?: string;
}

export interface CreateMatchFormData {
  title: string;
  description?: string;
  courtId?: string;
  sportId: number;
  maxPlayers: number;
  minPlayers?: number;
  skillLevel: SkillLevel;
  genderRestrict: GenderRestrict;
  ageMin?: number;
  ageMax?: number;
  matchDate: string;
  startTime: string;
  endTime?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  costPerPerson?: number;
  isFree: boolean;
  hasChat?: boolean;
  allowJoinRequest?: boolean;
}

export interface MatchSearchParams {
  query?: string;
  sportId?: number;
  province?: string;
  district?: string;
  skillLevel?: SkillLevel;
  genderRestrict?: GenderRestrict;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  status?: MatchStatus;
  lat?: number;
  lng?: number;
  radius?: number;
  date?: string;
  page?: number;
  limit?: number;
}
