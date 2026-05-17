// Match Types

export enum MatchStatus {
  OPEN = 'open',
  FULL = 'full',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL = 'all',
}

export enum GenderRestrict {
  MALE = 'male',
  FEMALE = 'female',
  ALL = 'all',
}

// Match Entity
export interface Match {
  id: string;
  creatorId: string;
  creator?: any;
  courtId: string | null;
  court?: any;
  sportId: number;
  sport?: any;
  title: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: number;
  skillLevel: string;
  genderRestrict: string;
  ageMin: number | null;
  ageMax: number | null;
  matchDate: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  locationAddress: string;
  costPerPerson: number;
  costIncludes: string[];
  isFree: boolean;
  totalCollected: number;
  status: MatchStatus;
  hasChat: boolean;
  allowJoinRequest: boolean;
  autoAccept: boolean;
  viewCount: number;
  joinCount: number;
  expireAfterHours: number;
  expiresAt: Date | null;
  players?: MatchPlayer[];
  messages?: MatchMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Match Player
export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  user?: any;
  role: string;
  paymentStatus: string;
  amountPaid: number;
  checkedIn: boolean;
  checkedInAt: Date | null;
  note: string;
  createdAt: Date;
}

// Match Message
export interface MatchMessage {
  id: string;
  matchId: string;
  senderId: string;
  sender?: any;
  messageType: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
}

// Create Match DTO
export interface CreateMatchDto {
  title: string;
  description?: string;
  courtId?: string;
  sportId: number;
  maxPlayers: number;
  minPlayers?: number;
  skillLevel?: SkillLevel;
  genderRestrict?: GenderRestrict;
  ageMin?: number;
  ageMax?: number;
  matchDate: Date;
  startTime: string;
  endTime?: string;
  durationHours?: number;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  costPerPerson?: number;
  costIncludes?: string[];
  isFree?: boolean;
  hasChat?: boolean;
  allowJoinRequest?: boolean;
  autoAccept?: boolean;
  expireAfterHours?: number;
}

// Match Query DTO
export interface MatchQueryDto {
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
  myMatches?: boolean;
}
