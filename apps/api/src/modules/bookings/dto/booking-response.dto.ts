import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourtInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;
}

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  avatarUrl?: string;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingCode: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: UserInfoDto })
  user?: UserInfoDto;

  @ApiProperty()
  courtId: string;

  @ApiProperty({ type: CourtInfoDto })
  court?: CourtInfoDto;

  @ApiPropertyOptional()
  sportId?: number;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  bookingDate: Date;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  depositAmount: number;

  @ApiProperty()
  depositPaid: boolean;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  qrCode?: string;

  @ApiPropertyOptional()
  qrVerifiedAt?: Date;

  @ApiPropertyOptional()
  playerName?: string;

  @ApiPropertyOptional()
  playerPhone?: string;

  @ApiProperty()
  playerCount: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  data: BookingResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}

export class TimeSlotDto {
  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional()
  price?: number;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  courtId: string;

  @ApiProperty({ type: [TimeSlotDto] })
  slots: TimeSlotDto[];

  @ApiPropertyOptional()
  openTime?: string;

  @ApiPropertyOptional()
  closeTime?: string;

  @ApiPropertyOptional()
  slotDuration?: number;
}
