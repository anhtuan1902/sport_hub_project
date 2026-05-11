import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsObject, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MessageType } from '../enums';

export class SendMessageDto {
  @ApiProperty({ example: 'Xin chào! Tôi muốn hỏi về sân bóng này.' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({ description: 'Metadata for special message types' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reply to message ID' })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class UpdateMessageDto {
  @ApiProperty({ example: 'Nội dung đã chỉnh sửa' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MinLength(1)
  content: string;
}
