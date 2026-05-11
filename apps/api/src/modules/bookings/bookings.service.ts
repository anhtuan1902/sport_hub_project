import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not, In } from 'typeorm';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Court } from '../../entities/court.entity';
import { CourtSport } from '../../entities/court.entity';
import {
  CreateBookingDto,
  BookingQueryDto,
  BookingResponseDto,
  BookingListResponseDto,
  AvailabilityResponseDto,
  TimeSlotDto,
} from './dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
  ) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    const court = await this.courtRepository.findOne({ where: { id: dto.courtId } });
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.status !== 'active') {
      throw new BadRequestException('Sân không hoạt động');
    }

    const existingBooking = await this.checkSlotAvailability(
      dto.courtId,
      dto.bookingDate,
      dto.startTime,
      dto.endTime,
    );

    if (existingBooking) {
      throw new ConflictException('Khung giờ này đã có người đặt');
    }

    const durationMinutes = this.calculateDuration(dto.startTime, dto.endTime);
    const finalPrice = this.calculatePrice(court, dto.bookingDate, durationMinutes);

    const bookingCode = this.generateBookingCode();
    const qrCode = this.generateQRCode(bookingCode);

    const booking = this.bookingRepository.create({
      bookingCode,
      userId,
      courtId: dto.courtId,
      sportId: dto.sportId,
      ownerId: court.ownerId,
      bookingDate: new Date(dto.bookingDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationMinutes,
      basePrice: court.basePrice,
      finalPrice,
      depositAmount: Math.round(finalPrice * 0.3),
      status: BookingStatus.PENDING_PAYMENT,
      qrCode,
      playerCount: dto.playerCount || 1,
      playerName: dto.playerName,
      playerPhone: dto.playerPhone,
      notes: dto.notes,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    await this.courtRepository.increment({ id: dto.courtId }, 'totalBookings', 1);

    return this.findOne(savedBooking.id);
  }

  async findAll(query: BookingQueryDto): Promise<BookingListResponseDto> {
    const { courtId, userId, dateFrom, dateTo, status, page = 1, limit = 20 } = query;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.court', 'court')
      .leftJoinAndSelect('booking.user', 'user');

    if (courtId) {
      queryBuilder.andWhere('booking.courtId = :courtId', { courtId });
    }

    if (userId) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
    }

    if (dateFrom) {
      queryBuilder.andWhere('booking.bookingDate >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }

    if (dateTo) {
      queryBuilder.andWhere('booking.bookingDate <= :dateTo', { dateTo: new Date(dateTo) });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    queryBuilder.orderBy('booking.bookingDate', 'DESC').addOrderBy('booking.startTime', 'DESC');

    const total = await queryBuilder.getCount();
    const bookings = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: bookings.map((b) => this.mapToResponse(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['court', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    return this.mapToResponse(booking);
  }

  async findByCode(bookingCode: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: ['court', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    return this.mapToResponse(booking);
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<BookingListResponseDto> {
    const [bookings, total] = await this.bookingRepository.findAndCount({
      where: { userId },
      relations: ['court'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: bookings.map((b) => this.mapToResponse(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findByCourt(courtId: string, page = 1, limit = 20): Promise<BookingListResponseDto> {
    const [bookings, total] = await this.bookingRepository.findAndCount({
      where: { courtId },
      relations: ['user'],
      order: { bookingDate: 'DESC', startTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: bookings.map((b) => this.mapToResponse(b)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async cancel(id: string, userId: string, reason?: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.userId !== userId && booking.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy booking này');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking đã được hủy trước đó');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy booking đã hoàn thành');
    }

    if (booking.status === BookingStatus.CHECKED_IN) {
      throw new BadRequestException('Không thể hủy booking đã check-in');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || 'Hủy bởi người dùng';
    booking.cancelledAt = new Date();

    await this.bookingRepository.save(booking);

    return this.findOne(id);
  }

  async confirm(bookingId: string, ownerId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận booking này');
    }

    if (booking.status !== BookingStatus.PENDING_CONFIRMATION) {
      throw new BadRequestException('Booking không ở trạng thái chờ xác nhận');
    }

    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepository.save(booking);

    return this.findOne(bookingId);
  }

  async checkIn(bookingId: string, ownerId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền check-in booking này');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking phải được xác nhận trước khi check-in');
    }

    booking.status = BookingStatus.CHECKED_IN;
    await this.bookingRepository.save(booking);

    return this.findOne(bookingId);
  }

  async complete(bookingId: string, ownerId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền hoàn thành booking này');
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException('Booking phải được check-in trước khi hoàn thành');
    }

    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepository.save(booking);

    await this.courtRepository.increment({ id: booking.courtId }, 'totalRevenue', Number(booking.finalPrice));

    return this.findOne(bookingId);
  }

  async verifyQR(qrCode: string, ownerId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({ where: { qrCode } });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xác minh booking này');
    }

    booking.qrVerifiedAt = new Date();
    booking.qrVerifiedBy = ownerId;

    if (booking.status === BookingStatus.CONFIRMED) {
      booking.status = BookingStatus.CHECKED_IN;
    }

    await this.bookingRepository.save(booking);

    return this.findOne(booking.id);
  }

  async getAvailability(
    courtId: string,
    date: string,
  ): Promise<AvailabilityResponseDto> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    const bookings = await this.bookingRepository.find({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: Not(In([BookingStatus.CANCELLED, BookingStatus.NO_SHOW])),
      },
      order: { startTime: 'ASC' },
    });

    const bookedSlots = bookings.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    }));

    const slots = this.generateTimeSlots(court.openTime, court.closeTime, court.slotDuration);

    const availableSlots: TimeSlotDto[] = slots.map((slot) => {
      const isBooked = bookedSlots.some((booked) =>
        this.isTimeOverlap(slot.start, slot.end, booked.startTime, booked.endTime),
      );

      return {
        startTime: slot.start,
        endTime: slot.end,
        available: !isBooked,
        price: this.calculatePriceForSlot(court, date, slot.start),
      };
    });

    return {
      date,
      courtId,
      slots: availableSlots,
      openTime: court.openTime,
      closeTime: court.closeTime,
      slotDuration: court.slotDuration,
    };
  }

  async checkSlotAvailability(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const existingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.courtId = :courtId', { courtId })
      .andWhere('booking.bookingDate = :date', { date: new Date(date) })
      .andWhere('booking.status NOT IN (:... statuses)', {
        statuses: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      })
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime },
      )
      .getOne();

    return !!existingBooking;
  }

  private generateBookingCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
  }

  private generateQRCode(bookingCode: string): string {
    return Buffer.from(bookingCode).toString('base64');
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }

  private calculatePrice(court: Court, dateStr: string, durationMinutes: number): number {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let pricePerHour = Number(court.basePrice);

    if (isWeekend && court.weekendPrice) {
      pricePerHour = Number(court.weekendPrice);
    }

    return pricePerHour * (durationMinutes / 60);
  }

  private calculatePriceForSlot(court: Court, dateStr: string, startTime: string): number {
    const [hour] = startTime.split(':').map(Number);
    const isPeakHour = hour >= 17 && hour <= 21;

    let price = Number(court.basePrice);

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend && court.weekendPrice) {
      price = Number(court.weekendPrice);
    }

    if (isPeakHour && court.peakHourPrice) {
      price = Number(court.peakHourPrice);
    }

    return price;
  }

  private generateTimeSlots(
    openTime: string,
    closeTime: string,
    durationMinutes: number,
  ): { start: string; end: string }[] {
    const slots: { start: string; end: string }[] = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    while (currentMinutes + durationMinutes <= closeMinutes) {
      const startHour = Math.floor(currentMinutes / 60);
      const startMin = currentMinutes % 60;
      const endMinutes = currentMinutes + durationMinutes;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      slots.push({
        start: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
        end: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
      });

      currentMinutes += durationMinutes;
    }

    return slots;
  }

  private isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    return toMinutes(start1) < toMinutes(end2) && toMinutes(end1) > toMinutes(start2);
  }

  private mapToResponse(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      userId: booking.userId,
      user: booking.user
        ? {
            id: booking.user.id,
            fullName: booking.user.fullName,
            avatarUrl: booking.user.avatarUrl,
          }
        : undefined,
      courtId: booking.courtId,
      court: booking.court
        ? {
            id: booking.court.id,
            name: booking.court.name,
            address: booking.court.address,
            coverImageUrl: booking.court.coverImageUrl,
          }
        : undefined,
      sportId: booking.sportId,
      ownerId: booking.ownerId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      basePrice: Number(booking.basePrice),
      discountAmount: Number(booking.discountAmount) || 0,
      finalPrice: Number(booking.finalPrice),
      depositAmount: Number(booking.depositAmount) || 0,
      depositPaid: booking.depositPaid,
      totalPaid: Number(booking.totalPaid) || 0,
      status: booking.status,
      qrCode: booking.qrCode,
      qrVerifiedAt: booking.qrVerifiedAt,
      playerName: booking.playerName,
      playerPhone: booking.playerPhone,
      playerCount: booking.playerCount,
      notes: booking.notes,
      cancellationReason: booking.cancellationReason,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
