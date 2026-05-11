import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
  AddParticipantDto,
  MarkReadDto,
  SendMessageDto,
  UpdateMessageDto,
  ConversationQueryDto,
  MessageQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ============ HEALTH ============

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Chat service is healthy' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ============ CONVERSATIONS ============

  @Post('conversations')
  @ApiOperation({ summary: 'Tạo cuộc trò chuyện mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  async createConversation(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Lấy danh sách cuộc trò chuyện' })
  async getConversations(
    @CurrentUser() user: CurrentUserData,
    @Query() query: ConversationQueryDto,
  ) {
    return this.chatService.findAllConversations(user.id, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Lấy chi tiết cuộc trò chuyện' })
  async getConversation(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatService.findOneConversation(id, user.id);
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Cập nhật cuộc trò chuyện' })
  async updateConversation(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(id, user.id, dto);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa cuộc trò chuyện' })
  async deleteConversation(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.chatService.deleteConversation(id, user.id);
  }

  @Post('conversations/:id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rời khỏi cuộc trò chuyện' })
  async leaveConversation(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.chatService.leaveConversation(id, user.id);
  }

  // ============ PARTICIPANTS ============

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Thêm người tham gia' })
  async addParticipant(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddParticipantDto,
  ) {
    const { ParticipantRole } = await import('./enums');
    const conversation = await this.chatService.findOneConversation(id, user.id);
    const participant = conversation.participants.find((p) => p.userId === user.id);

    if (!participant || (participant.role !== 'owner' && participant.role !== 'admin')) {
      throw new Error('Bạn không có quyền thêm người tham gia');
    }

    return this.chatService.addParticipant(id, dto.userId, ParticipantRole.MEMBER, dto.nickname);
  }

  @Delete('conversations/:id/participants/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa người tham gia' })
  async removeParticipant(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ) {
    await this.chatService.removeParticipant(id, targetUserId, user.id);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  async markAsRead(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkReadDto,
  ) {
    await this.chatService.markAsRead(id, user.id, dto.messageId);
    return { success: true };
  }

  @Post('conversations/:id/mute')
  @ApiOperation({ summary: 'Bật/tắt thông báo' })
  async toggleMute(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isMuted = await this.chatService.toggleMute(id, user.id);
    return { isMuted };
  }

  @Post('conversations/:id/pin')
  @ApiOperation({ summary: 'Ghim/bỏ ghim cuộc trò chuyện' })
  async togglePin(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isPinned = await this.chatService.togglePin(id, user.id);
    return { isPinned };
  }

  // ============ MESSAGES ============

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Lấy danh sách tin nhắn' })
  async getMessages(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.chatService.findMessages(id, user.id, query);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Gửi tin nhắn' })
  @ApiResponse({ status: 201, description: 'Gửi thành công' })
  async sendMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(id, user.id, dto);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Chỉnh sửa tin nhắn' })
  async updateMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    return this.chatService.updateMessage(id, user.id, dto);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  async deleteMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.chatService.deleteMessage(id, user.id);
  }

  // ============ OWNER ============

  @Get('courts/:courtId/conversations')
  @ApiOperation({ summary: 'Lấy danh sách cuộc trò chuyện về sân (chủ sân)' })
  async getCourtConversations(
    @CurrentUser() user: CurrentUserData,
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getCourtConversations(courtId, user.id, page, limit);
  }

  // ============ STATS ============

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số tin nhắn chưa đọc' })
  async getUnreadCount(@CurrentUser() user: CurrentUserData) {
    const count = await this.chatService.getTotalUnreadCount(user.id);
    return { unreadCount: count };
  }
}
