import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CourtStatus } from '../../../entities/court.entity';

export class CourtQueryDto {
  @ApiPropertyOptional({ example: 'sân bóng', description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo sport ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sportId?: number;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh', description: 'Tỉnh/Thành phố' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Quận 1', description: 'Quận/Huyện' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 0, description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000, description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: '1,2,3', description: 'Danh sách amenity IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiPropertyOptional({ enum: CourtStatus, description: 'Trạng thái sân' })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;

  @ApiPropertyOptional({ example: true, description: 'Chỉ sân đã được xác minh' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verifiedOnly?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Chỉ sân nổi bật' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featuredOnly?: boolean;

  @ApiPropertyOptional({ example: 10.8231, description: 'Vĩ độ người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 106.6292, description: 'Kinh độ người dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 10, description: 'Bán kính tìm kiếm (km)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number;

  @ApiPropertyOptional({ example: 'rating', description: 'Sắp xếp: price, rating, distance, createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'DESC', description: 'Thứ tự: ASC, DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ example: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Số item mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
