import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSportDto {
  @ApiPropertyOptional({ example: 'Bóng đá 5' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '/icons/football-5.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'Sân bóng đá 5 người' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
