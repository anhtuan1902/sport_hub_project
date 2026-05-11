import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSportDto {
  @ApiPropertyOptional({ example: 'Bóng đá 5' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'football-5' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '/icons/football-5.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'Sân bóng đá 5 người' })
  @IsOptional()
  @IsString()
  description?: string;
}
