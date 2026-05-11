import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAmenityDto {
  @ApiPropertyOptional({ example: 'Máy lạnh' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '/icons/air-conditioner.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'facility' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
