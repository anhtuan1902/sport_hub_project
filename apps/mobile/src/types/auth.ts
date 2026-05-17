import { Gender } from '@sport-hub/shared';

// Re-export shared types
export type {
  User,
  UserStatus,
  AuthProvider,
  Gender,
  UserRole,
  CreateUserDto,
  LoginDto,
  AuthResponse,
  JwtPayload,
  UserProfile,
} from '@sport-hub/shared';

// Mobile-specific auth types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
}
