import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BookingPayment, PaymentMethod, PaymentType, PaymentStatus } from '../../entities/payment.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import {
  CreatePaymentDto,
  PaymentQueryDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  VNPayReturnDto,
  RefundPaymentDto,
  VNPayPaymentUrlDto,
} from './dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly vnpTmnCode: string;
  private readonly vnpHashSecret: string;
  private readonly vnpUrl: string;
  private readonly vnpReturnUrl: string;

  constructor(
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private configService: ConfigService,
  ) {
    this.vnpTmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || '';
    this.vnpHashSecret = this.configService.get<string>('VNPAY_HASH_SECRET') || '';
    this.vnpUrl = this.configService.get<string>('VNPAY_URL') || 'https://sandbox.vnpayment.vn';
    this.vnpReturnUrl = this.configService.get<string>('VNPAY_RETURN_URL') || 'http://localhost:3000/api/v1/payments/vnpay/return';
  }

  async createPaymentUrl(userId: string, dto: CreatePaymentDto): Promise<VNPayPaymentUrlDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.userId !== userId) {
      throw new UnauthorizedException('Bạn không có quyền thanh toán booking này');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking không ở trạng thái chờ thanh toán');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        bookingId: dto.bookingId,
        status: PaymentStatus.SUCCESS,
      },
    });

    if (existingPayment) {
      throw new BadRequestException('Booking đã được thanh toán');
    }

    const paymentType = dto.paymentType || PaymentType.DEPOSIT;
    const amount = paymentType === PaymentType.FULL ? booking.finalPrice : booking.depositAmount;

    const payment = this.paymentRepository.create({
      bookingId: dto.bookingId,
      amount,
      paymentMethod: dto.paymentMethod,
      paymentType,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    if (dto.paymentMethod === PaymentMethod.VNPAY) {
      const paymentUrl = await this.createVNPayUrl(savedPayment.id, amount, booking.bookingCode);
      return {
        paymentUrl,
        txnRef: savedPayment.id,
      };
    }

    return {
      paymentUrl: `mock://payment/${savedPayment.id}`,
      txnRef: savedPayment.id,
    };
  }

  private async createVNPayUrl(paymentId: string, amount: number, orderInfo: string): Promise<string> {
    const vnp_Version = '2.1.0';
    const vnp_Command = 'pay';
    const vnp_TmnCode = this.vnpTmnCode;
    const vnp_Locale = 'vn';
    const vnp_CurrCode = 'VND';
    const vnp_TxnRef = paymentId;
    const vnp_OrderInfo = orderInfo || `Thanh toan booking ${paymentId}`;
    const vnp_Amount = Math.round(amount) * 100;
    const vnp_ReturnUrl = this.vnpReturnUrl;
    const vnp_IpAddr = '127.0.0.1';
    const vnp_CreateDate = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

    const params: Record<string, string> = {
      vnp_Version,
      vnp_Command,
      vnp_TmnCode,
      vnp_Locale,
      vnp_CurrCode,
      vnp_TxnRef,
      vnp_OrderInfo,
      vnp_Amount: vnp_Amount.toString(),
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate,
    };

    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});

    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const secureHash = crypto
      .createHmac('sha512', this.vnpHashSecret)
      .update(queryString)
      .digest('hex');

    return `${this.vnpUrl}/paymentv2/vpcpay.html?${queryString}&vnp_SecureHash=${secureHash}`;
  }

  async handleVNPayReturn(query: VNPayReturnDto): Promise<PaymentResponseDto> {
    const { vnp_ResponseCode, vnp_TransactionStatus, vnp_TxnRef, vnp_Amount, vnp_BankCode } = query;

    const payment = await this.paymentRepository.findOne({
      where: { id: vnp_TxnRef },
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    const isSuccess = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

    payment.status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    payment.gatewayTxnId = query.vnp_TransactionNo || '';
    payment.gatewayData = query;

    await this.paymentRepository.save(payment);

    if (isSuccess) {
      await this.bookingRepository.update(payment.bookingId, {
        status: BookingStatus.PENDING_CONFIRMATION,
        totalPaid: payment.amount,
        depositPaid: true,
      });
    }

    return this.findOne(payment.id);
  }

  async findAll(query: PaymentQueryDto): Promise<PaymentListResponseDto> {
    const { bookingId, userId, status, paymentMethod, page = 1, limit = 20 } = query;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking');

    if (bookingId) {
      queryBuilder.andWhere('payment.bookingId = :bookingId', { bookingId });
    }

    if (userId && queryBuilder.expressionMap.mainAlias) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod });
    }

    queryBuilder.orderBy('payment.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const payments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: payments.map((p) => this.mapToResponse(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    return this.mapToResponse(payment);
  }

  async findByBooking(bookingId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.find({
      where: { bookingId },
      order: { createdAt: 'DESC' },
    });

    return payments.map((p) => this.mapToResponse(p));
  }

  async confirmPayment(paymentId: string, gatewayTxnId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return this.mapToResponse(payment);
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.gatewayTxnId = gatewayTxnId;

    await this.paymentRepository.save(payment);

    await this.bookingRepository.update(payment.bookingId, {
      status: BookingStatus.PENDING_CONFIRMATION,
      totalPaid: payment.amount,
      depositPaid: payment.paymentType === PaymentType.DEPOSIT,
    });

    return this.findOne(paymentId);
  }

  async refund(paymentId: string, adminId: string, dto: RefundPaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Chỉ có thể hoàn tiền payment đã thanh toán');
    }

    if (dto.refundAmount > payment.amount) {
      throw new BadRequestException('Số tiền hoàn không được vượt quá số tiền đã thanh toán');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundAmount = dto.refundAmount;
    payment.refundReason = dto.reason || null;
    payment.refundedAt = new Date();
    payment.refundedBy = adminId;

    await this.paymentRepository.save(payment);

    const booking = await this.bookingRepository.findOne({
      where: { id: payment.bookingId },
    });

    if (booking) {
      await this.bookingRepository.update(booking.id, {
        status: BookingStatus.REFUNDED,
        totalPaid: booking.totalPaid - dto.refundAmount,
      });
    }

    return this.findOne(paymentId);
  }

  async cancelPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment không tồn tại');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy payment đang chờ');
    }

    payment.status = PaymentStatus.CANCELLED;
    await this.paymentRepository.save(payment);

    return this.findOne(paymentId);
  }

  private mapToResponse(payment: BookingPayment): PaymentResponseDto {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      gatewayTxnId: payment.gatewayTxnId,
      status: payment.status,
      refundAmount: payment.refundAmount ? Number(payment.refundAmount) : 0,
      refundReason: payment.refundReason,
      refundedAt: payment.refundedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      booking: payment.booking
        ? {
            id: payment.booking.id,
            bookingCode: payment.booking.bookingCode,
            status: payment.booking.status,
          }
        : undefined,
    };
  }
}
