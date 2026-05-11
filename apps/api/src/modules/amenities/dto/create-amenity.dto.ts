import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmenityDto {
  @ApiPropertyOptional({ example: 'Máy lạnh' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'air_conditioner' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '/icons/air-conditioner.png' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'facility' })
  @IsOptional()
  @IsString()
  category?: string;
}
