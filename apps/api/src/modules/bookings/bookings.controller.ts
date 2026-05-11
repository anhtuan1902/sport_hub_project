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
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  BookingQueryDto,
  BookingResponseDto,
  BookingListResponseDto,
  AvailabilityResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo booking mới' })
  @ApiResponse({ status: 201, description: 'Tạo booking thành công', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Khung giờ đã có người đặt' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bookings (admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách bookings', type: BookingListResponseDto })
  async findAll(@Query() query: BookingQueryDto): Promise<BookingListResponseDto> {
    return this.bookingsService.findAll(query);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Lấy danh sách booking của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách booking', type: BookingListResponseDto })
  async getMyBookings(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<BookingListResponseDto> {
    return this.bookingsService.findByUser(user.id, page, limit);
  }

  @Get('court/:courtId')
  @ApiOperation({ summary: 'Lấy danh sách booking của một sân' })
  @ApiResponse({ status: 200, description: 'Danh sách bookings', type: BookingListResponseDto })
  async getCourtBookings(
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<BookingListResponseDto> {
    return this.bookingsService.findByCourt(courtId, page, limit);
  }

  @Get('availability/:courtId')
  @ApiOperation({ summary: 'Kiểm tra availability của sân' })
  @ApiResponse({ status: 200, description: 'Thông tin availability', type: AvailabilityResponseDto })
  async getAvailability(
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @Query('date') date: string,
  ): Promise<AvailabilityResponseDto> {
    return this.bookingsService.getAvailability(courtId, date);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy thông tin booking theo mã' })
  @ApiResponse({ status: 200, description: 'Thông tin booking', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findByCode(@Param('code') code: string): Promise<BookingResponseDto> {
    return this.bookingsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin booking theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin booking', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Hủy booking' })
  @ApiResponse({ status: 200, description: 'Hủy booking thành công', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Không thể hủy' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body('reason') reason?: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(id, user.id, reason);
  }

  @Put(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Xác nhận booking (chủ sân)' })
  @ApiResponse({ status: 200, description: 'Xác nhận thành công', type: BookingResponseDto })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.confirm(id, user.id);
  }

  @Put(':id/check-in')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Check-in booking (chủ sân)' })
  @ApiResponse({ status: 200, description: 'Check-in thành công', type: BookingResponseDto })
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.checkIn(id, user.id);
  }

  @Put(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Hoàn thành booking (chủ sân)' })
  @ApiResponse({ status: 200, description: 'Hoàn thành thành công', type: BookingResponseDto })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.complete(id, user.id);
  }

  @Post('verify-qr')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Xác minh QR code' })
  @ApiResponse({ status: 200, description: 'Xác minh thành công', type: BookingResponseDto })
  async verifyQR(
    @Body('qrCode') qrCode: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.verifyQR(qrCode, user.id);
  }
}
