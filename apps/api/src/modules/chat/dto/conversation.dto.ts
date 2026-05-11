import { IsEnum, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ConversationType } from '../enums';

export class CreateConversationDto {
  @ApiPropertyOptional({ enum: ConversationType, default: ConversationType.DIRECT })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiPropertyOptional({ description: 'UUID of the court (required for type COURT_INQUIRY)' })
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiPropertyOptional({ example: 'Nhóm bóng đá Chủ nhật' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isGroup?: boolean;

  @ApiPropertyOptional({ description: 'Participant user IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}

export class UpdateConversationDto {
  @ApiPropertyOptional({ example: 'Tên cuộc trò chuyện mới' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isGroup?: boolean;
}

export class AddParticipantDto {
  @ApiProperty({ description: 'User ID to add', type: String })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Biệt danh trong nhóm' })
  @IsOptional()
  @IsString()
  nickname?: string;
}

export class MarkReadDto {
  @ApiProperty({ description: 'Last read message ID' })
  @IsUUID()
  messageId: string;
}
