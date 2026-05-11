import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Booking ID đã hoàn thành' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ description: 'Điểm tổng thể', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating: number;

  @ApiPropertyOptional({ description: 'Điểm chất lượng sân', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  courtRating?: number;

  @ApiPropertyOptional({ description: 'Điểm chất lượng dịch vụ', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ description: 'Điểm vị trí', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  locationRating?: number;

  @ApiPropertyOptional({ description: 'Điểm giá cả', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priceRating?: number;

  @ApiPropertyOptional({ description: 'Tiêu đề review', maxLength: 200 })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung review' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Danh sách URL hình ảnh', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Điểm tổng thể', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overallRating?: number;

  @ApiPropertyOptional({ description: 'Điểm chất lượng sân', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  courtRating?: number;

  @ApiPropertyOptional({ description: 'Điểm chất lượng dịch vụ', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @ApiPropertyOptional({ description: 'Điểm vị trí', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  locationRating?: number;

  @ApiPropertyOptional({ description: 'Điểm giá cả', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priceRating?: number;

  @ApiPropertyOptional({ description: 'Tiêu đề review', maxLength: 200 })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Nội dung review' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Danh sách URL hình ảnh', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class ReviewQueryDto {
  @ApiPropertyOptional({ description: 'Court ID' })
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Đã được xác minh' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Được đánh dấu nổi bật' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Đã bị báo cáo' })
  @IsOptional()
  @IsBoolean()
  isReported?: boolean;

  @ApiPropertyOptional({ description: 'Trang', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class ReportReviewDto {
  @ApiPropertyOptional({ description: 'Lý do báo cáo' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RespondToReviewDto {
  @ApiProperty({ description: 'Nội dung phản hồi' })
  @IsString()
  response: string;
}

export class ReviewUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ type: ReviewUserDto })
  user?: ReviewUserDto;

  @ApiProperty()
  courtId: string;

  @ApiProperty()
  overallRating: number;

  @ApiPropertyOptional()
  courtRating?: number;

  @ApiPropertyOptional()
  serviceRating?: number;

  @ApiPropertyOptional()
  locationRating?: number;

  @ApiPropertyOptional()
  priceRating?: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional({ type: [String] })
  images?: string[];

  @ApiProperty()
  helpfulCount: number;

  @ApiProperty()
  reportCount: number;

  @ApiProperty()
  isReported: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiPropertyOptional()
  adminResponse?: string;

  @ApiPropertyOptional()
  respondedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ReviewListResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  data: ReviewResponseDto[];

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

export class CourtReviewSummaryDto {
  @ApiProperty()
  courtId: string;

  @ApiProperty()
  courtName: string;

  @ApiProperty()
  avgOverallRating: number;

  @ApiProperty()
  avgCourtRating: number;

  @ApiProperty()
  avgServiceRating: number;

  @ApiProperty()
  avgLocationRating: number;

  @ApiProperty()
  avgPriceRating: number;

  @ApiProperty()
  totalReviews: number;

  @ApiProperty({
    description: 'Phân bố điểm đánh giá',
    example: { 1: 5, 2: 10, 3: 25, 4: 80, 5: 180 },
  })
  ratingDistribution: Record<number, number>;
}
