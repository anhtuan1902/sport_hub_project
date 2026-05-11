import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification } from '../../entities/notification.entity';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationListResponseDto,
  NotificationType,
  NotificationChannel,
} from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      imageUrl: dto.imageUrl,
      actionUrl: dto.actionUrl,
      data: dto.data || {},
      channels: dto.channels || [NotificationChannel.IN_APP],
    });

    const saved = await this.notificationRepository.save(notification);

    this.eventEmitter.emit('notification.created', saved);

    return this.mapToResponse(saved);
  }

  async createBatch(notifications: CreateNotificationDto[]): Promise<NotificationResponseDto[]> {
    const entities = notifications.map((dto) =>
      this.notificationRepository.create({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        imageUrl: dto.imageUrl,
        actionUrl: dto.actionUrl,
        data: dto.data || {},
        channels: dto.channels || [NotificationChannel.IN_APP],
      }),
    );

    const saved = await this.notificationRepository.save(entities);

    saved.forEach((notification) => {
      this.eventEmitter.emit('notification.created', notification);
    });

    return saved.map((n) => this.mapToResponse(n));
  }

  async findAll(query: NotificationQueryDto): Promise<NotificationListResponseDto> {
    const { userId, type, isRead, page = 1, limit = 20 } = query;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('1=1');

    if (userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    const notifications = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: notifications.map((n) => this.mapToResponse(n)),
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<NotificationListResponseDto> {
    return this.findAll({ userId, page, limit });
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification không tồn tại');
    }

    return this.mapToResponse(notification);
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification không tồn tại');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await this.notificationRepository.save(notification);

    return this.mapToResponse(notification);
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { message: 'Đã đánh dấu tất cả là đã đọc' };
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification không tồn tại');
    }

    await this.notificationRepository.remove(notification);

    return { message: 'Xóa notification thành công' };
  }

  async deleteAll(userId: string): Promise<{ message: string }> {
    await this.notificationRepository.delete({ userId });

    return { message: 'Xóa tất cả notification thành công' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { count };
  }

  async sendBookingConfirmation(userId: string, booking: any): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.BOOKING,
      title: 'Xác nhận đặt sân thành công',
      message: `Bạn đã đặt sân ${booking.courtName} vào lúc ${booking.startTime} ngày ${booking.bookingDate}`,
      actionUrl: `/bookings/${booking.id}`,
      data: { bookingId: booking.id },
    });
  }

  async sendBookingReminder(userId: string, booking: any): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.BOOKING,
      title: 'Nhắc nhở đặt sân',
      message: `Bạn có lịch đặt sân ${booking.courtName} vào lúc ${booking.startTime} ngày mai`,
      actionUrl: `/bookings/${booking.id}`,
      data: { bookingId: booking.id },
    });
  }

  async sendMatchInvite(
    userId: string,
    match: any,
    inviterName: string,
  ): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.MATCH,
      title: 'Lời mời tham gia trận đấu',
      message: `${inviterName} mời bạn tham gia trận đấu "${match.title}"`,
      actionUrl: `/matches/${match.id}`,
      data: { matchId: match.id },
    });
  }

  async sendPaymentSuccess(
    userId: string,
    payment: any,
  ): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Thanh toán thành công',
      message: `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ cho booking đã được xác nhận`,
      actionUrl: `/payments/${payment.id}`,
      data: { paymentId: payment.id, bookingId: payment.bookingId },
    });
  }

  async sendMatchUpdate(
    userId: string,
    match: any,
    message: string,
  ): Promise<void> {
    await this.create({
      userId,
      type: NotificationType.MATCH,
      title: 'Cập nhật trận đấu',
      message,
      actionUrl: `/matches/${match.id}`,
      data: { matchId: match.id },
    });
  }

  private mapToResponse(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      imageUrl: notification.imageUrl,
      actionUrl: notification.actionUrl,
      data: notification.data || {},
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
