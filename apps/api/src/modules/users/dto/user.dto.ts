import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Gender, UserStatus, AuthProvider } from '../../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender | null;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional()
  rank?: {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string | null;
    color?: string | null;
  } | null;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty({ enum: AuthProvider })
  authProvider: AuthProvider;

  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  postCount: number;

  @ApiPropertyOptional()
  lastLoginAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender | null;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiPropertyOptional()
  rank?: {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string | null;
    color?: string | null;
  } | null;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  postCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class UserPublicProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ enum: Gender })
  gender?: Gender | null;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiPropertyOptional()
  rank?: {
    id: number;
    name: string;
    slug: string;
    iconUrl?: string | null;
    color?: string | null;
  } | null;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class UpdateAvatarDto {
  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  avatarUrl: string;
}

export class UserQueryDto {
  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  query?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class UserStatsDto {
  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  postCount: number;

  @ApiProperty()
  winRate?: number;
}
