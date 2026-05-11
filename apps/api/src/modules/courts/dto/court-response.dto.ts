import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SportResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  courtCount: number;
}

export class AmenityResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  category?: string;
}

export class CourtImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  caption?: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isVerified: boolean;
}

export class CourtResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  address: string;

  @ApiPropertyOptional()
  province?: string;

  @ApiPropertyOptional()
  district?: string;

  @ApiPropertyOptional()
  ward?: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  facebookUrl?: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  priceUnit: string;

  @ApiPropertyOptional()
  weekendPrice?: number;

  @ApiPropertyOptional()
  peakHourPrice?: number;

  @ApiProperty()
  openTime: string;

  @ApiProperty()
  closeTime: string;

  @ApiProperty()
  slotDuration: number;

  @ApiProperty()
  avgRating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  totalBookings: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiPropertyOptional({ type: [SportResponseDto] })
  sports?: SportResponseDto[];

  @ApiPropertyOptional({ type: [AmenityResponseDto] })
  amenities?: AmenityResponseDto[];

  @ApiPropertyOptional({ type: [CourtImageResponseDto] })
  images?: CourtImageResponseDto[];

  @ApiProperty()
  distance?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CourtListResponseDto {
  @ApiProperty({ type: [CourtResponseDto] })
  data: CourtResponseDto[];

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

export class AddCourtImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Hình ảnh sân bóng' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ example: 'gallery' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCourtImageDto {
  @ApiPropertyOptional({ example: 'https://example.com/new-image.jpg' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'Caption mới' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
