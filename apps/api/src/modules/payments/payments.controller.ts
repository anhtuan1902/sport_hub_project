import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  PaymentQueryDto,
  PaymentResponseDto,
  PaymentListResponseDto,
  VNPayReturnDto,
  RefundPaymentDto,
  VNPayPaymentUrlDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay' })
  @ApiResponse({ status: 201, description: 'URL thanh toán', type: VNPayPaymentUrlDto })
  async createPaymentUrl(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreatePaymentDto,
  ): Promise<VNPayPaymentUrlDto> {
    return this.paymentsService.createPaymentUrl(user.id, dto);
  }

  @Get('vnpay/return')
  @ApiOperation({ summary: 'VNPay callback return URL' })
  @ApiResponse({ status: 200, description: 'Kết quả thanh toán' })
  async handleVNPayReturn(
    @Query() query: VNPayReturnDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.handleVNPayReturn(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách payments (admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách payments', type: PaymentListResponseDto })
  async findAll(@Query() query: PaymentQueryDto): Promise<PaymentListResponseDto> {
    return this.paymentsService.findAll(query);
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payments của một booking' })
  @ApiResponse({ status: 200, description: 'Danh sách payments', type: [PaymentResponseDto] })
  async findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết payment' })
  @ApiResponse({ status: 200, description: 'Thông tin payment', type: PaymentResponseDto })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Hoàn tiền (admin)' })
  @ApiResponse({ status: 200, description: 'Hoàn tiền thành công', type: PaymentResponseDto })
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.refund(id, user.id, dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy payment đang chờ' })
  @ApiResponse({ status: 200, description: 'Hủy thành công', type: PaymentResponseDto })
  async cancelPayment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.cancelPayment(id);
  }
}
