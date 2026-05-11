import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { CourtStatus } from '../../../entities/court.entity';

export class CreateCourtDto {
  @ApiProperty({ example: 'Sân bóng đá ABC', description: 'Tên sân' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sân không được để trống' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ example: 'Sân bóng đá 5 người chất lượng cao' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Đường Nguyễn Huệ, Quận 1' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Quận 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Phường Bến Nghé' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: 10.8231 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.6292 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@sanbong.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://sanbongabc.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/sanbongabc' })
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiProperty({ example: 150000, description: 'Giá cơ bản (VNĐ)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'hour', description: 'Đơn vị giá: hour, day, session' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiPropertyOptional({ example: 200000, description: 'Giá cuối tuần (VNĐ)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weekendPrice?: number;

  @ApiPropertyOptional({ example: 250000, description: 'Giá giờ cao điểm (VNĐ)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  peakHourPrice?: number;

  @ApiPropertyOptional({ example: '06:00', description: 'Giờ mở cửa' })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Giờ đóng cửa' })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiPropertyOptional({ example: 60, description: 'Thời lượng mỗi slot (phút)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(240)
  slotDuration?: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3], description: 'Danh sách sport IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  sportIds?: number[];

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3], description: 'Danh sách amenity IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  amenityIds?: number[];

  @ApiPropertyOptional({ type: [Number], example: [{ sportId: 1, price: 150000, isPrimary: true }] })
  @IsOptional()
  @IsArray()
  sports?: { sportId: number; price?: number; isPrimary?: boolean }[];
}
