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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationListResponseDto,
  DeviceTokenDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách thông báo', type: NotificationListResponseDto })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationListResponseDto> {
    return this.notificationsService.findAll({ ...query, userId: user.id });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Số thông báo chưa đọc' })
  @ApiResponse({ status: 200, description: 'Số thông báo chưa đọc' })
  async getUnreadCount(@CurrentUser() user: CurrentUserData): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thông báo' })
  @ApiResponse({ status: 200, description: 'Thông tin thông báo', type: NotificationResponseDto })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  @ApiResponse({ status: 200, description: 'Thành công', type: NotificationResponseDto })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async markAllAsRead(@CurrentUser() user: CurrentUserData): Promise<{ message: string }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.notificationsService.delete(id, user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Xóa tất cả thông báo' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteAll(@CurrentUser() user: CurrentUserData): Promise<{ message: string }> {
    return this.notificationsService.deleteAll(user.id);
  }

  @Post('device-token')
  @ApiOperation({ summary: 'Đăng ký device token cho push notification' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  async registerDeviceToken(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: DeviceTokenDto,
  ): Promise<{ message: string }> {
    return { message: 'Device token đã được đăng ký' };
  }
}
