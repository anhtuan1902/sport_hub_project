// User Status
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

// Auth Provider
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

// Gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// User Role
export enum UserRole {
  PLAYER = 'player',
  COURT_OWNER = 'court_owner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// User Entity
export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  bio?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  rankId: number;
  totalPoints: number;
  totalMatches: number;
  totalBookings: number;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Create User DTO
export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Auth Response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

// User Profile (Public)
export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  totalMatches: number;
  totalBookings: number;
  rankId: number;
  createdAt: Date;
}
