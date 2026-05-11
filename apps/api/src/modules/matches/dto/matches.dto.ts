import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsEnum,
  MaxLength,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MatchStatus } from '../../../entities/match.entity';

export class CreateMatchDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  sportId: number;

  @ApiPropertyOptional({ example: 'Tìm bạn chơi tennis sáng T7' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Cần 1 người chơi cùng trình độ trung bình' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(2)
  @Max(50)
  @Type(() => Number)
  maxPlayers: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minPlayers?: number;

  @ApiPropertyOptional({ example: 'intermediate', description: 'all, beginner, intermediate, advanced' })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiPropertyOptional({ example: 'all', description: 'all, male, female' })
  @IsOptional()
  @IsString()
  genderRestrict?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ageMax?: number;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  matchDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  startTime: string;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @Type(() => Number)
  durationHours?: number;

  @ApiPropertyOptional({ example: 'Sân Tennis ABC, Quận 1' })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({ example: 10.7769 })
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 106.7009 })
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ example: '123 Nguyễn Trãi, Q1, TP.HCM' })
  @IsOptional()
  @IsString()
  locationAddress?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Chi phí/người (VND)' })
  @IsOptional()
  @Type(() => Number)
  costPerPerson?: number;

  @ApiPropertyOptional({ example: ['Vợt', 'Cầu lông'] })
  @IsOptional()
  @IsString({ each: true })
  costIncludes?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasChat?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowJoinRequest?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoAccept?: boolean;

  @ApiPropertyOptional({ example: 72, description: 'Hết hạn sau bao nhiêu giờ' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  @Type(() => Number)
  expireAfterHours?: number;
}

export class UpdateMatchDto {
  @ApiPropertyOptional({ example: 'Tìm bạn chơi tennis sáng CN' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Cần 2 người chơi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(50)
  @Type(() => Number)
  maxPlayers?: number;

  @ApiPropertyOptional({ example: 'intermediate' })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiPropertyOptional({ example: 'all' })
  @IsOptional()
  @IsString()
  genderRestrict?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ageMax?: number;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  costPerPerson?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  autoAccept?: boolean;
}

export class MatchQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sportId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ example: 'all' })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiPropertyOptional({ example: 'all' })
  @IsOptional()
  @IsString()
  genderRestrict?: string;

  @ApiPropertyOptional({ example: 'open' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  hasSlots?: boolean;

  @ApiPropertyOptional({ example: 'upcoming' })
  @IsOptional()
  @IsString()
  sort?: string;

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
}

export class JoinMatchDto {
  @ApiPropertyOptional({ example: 'Muốn join đá banh' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

export class RespondJoinRequestDto {
  @ApiProperty({ example: 'accepted' })
  @IsString()
  @IsEnum(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';

  @ApiPropertyOptional({ example: 'Hết chỗ rồi' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'Mình đến nơi rồi!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({ example: 'text' })
  @IsOptional()
  @IsString()
  messageType?: string;
}

export class PlayerResponseDto {
  id: string;
  matchId: string;
  userId: string;
  role: string;
  paymentStatus: string;
  amountPaid: number;
  checkedIn: boolean;
  checkedInAt: Date;
  note: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
}

export class MatchResponseDto {
  id: string;
  creatorId: string;
  courtId: string;
  sportId: number;
  title: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: number;
  skillLevel: string;
  genderRestrict: string;
  ageMin: number;
  ageMax: number;
  matchDate: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  locationName: string;
  latitude: number;
  longitude: number;
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
  expiresAt: Date;
  creator?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
  court?: {
    id: string;
    name: string;
    address: string;
    coverImageUrl?: string | null;
  };
  sport?: {
    id: number;
    name: string;
    iconUrl?: string | null;
  };
  players?: PlayerResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class MatchListResponseDto {
  data: MatchResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class MatchSummaryDto {
  totalMatches: number;
  openMatches: number;
  myMatches: number;
  upcomingMatches: number;
}
