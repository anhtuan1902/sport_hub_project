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
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ReviewListResponseDto,
  CourtReviewSummaryDto,
  ReportReviewDto,
  RespondToReviewDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo review mới cho booking đã hoàn thành' })
  @ApiResponse({ status: 201, description: 'Tạo review thành công', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Booking không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Đã có review cho booking này' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách reviews (admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách reviews', type: ReviewListResponseDto })
  async findAll(@Query() query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    return this.reviewsService.findAll(query);
  }

  @Get('court/:courtId')
  @ApiOperation({ summary: 'Lấy danh sách review của một sân' })
  @ApiResponse({ status: 200, description: 'Danh sách reviews', type: ReviewListResponseDto })
  async getCourtReviews(
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('sort', new DefaultValuePipe('newest')) sort: string,
  ): Promise<ReviewListResponseDto> {
    return this.reviewsService.findByCourt(courtId, page, limit, sort);
  }

  @Get('court/:courtId/summary')
  @ApiOperation({ summary: 'Lấy tổng hợp review của một sân' })
  @ApiResponse({ status: 200, description: 'Tổng hợp reviews', type: CourtReviewSummaryDto })
  async getCourtReviewSummary(
    @Param('courtId', ParseUUIDPipe) courtId: string,
  ): Promise<CourtReviewSummaryDto> {
    return this.reviewsService.getCourtReviewSummary(courtId);
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách review của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách reviews', type: ReviewListResponseDto })
  async getMyReviews(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<ReviewListResponseDto> {
    return this.reviewsService.findByUser(user.id, page, limit);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Lấy review của một booking' })
  @ApiResponse({ status: 200, description: 'Thông tin review', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<ReviewResponseDto | null> {
    return this.reviewsService.findByBooking(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin review theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin review', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật review' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa review' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.reviewsService.delete(id, user.id);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu review hữu ích' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async voteHelpful(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.reviewsService.voteHelpful(id, user.id);
  }

  @Delete(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bỏ đánh dấu hữu ích' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  async removeVote(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.reviewsService.removeVote(id, user.id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Báo cáo review' })
  @ApiResponse({ status: 200, description: 'Báo cáo thành công' })
  async report(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: ReportReviewDto,
  ): Promise<{ message: string }> {
    return this.reviewsService.report(id, user.id, dto);
  }

  @Put(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Phản hồi review (chủ sân/admin)' })
  @ApiResponse({ status: 200, description: 'Phản hồi thành công', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async respondToReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RespondToReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.respondToReview(id, user.id, dto.response);
  }

  @Put(':id/feature')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Đánh dấu review nổi bật (admin)' })
  @ApiResponse({ status: 200, description: 'Thành công', type: ReviewResponseDto })
  async toggleFeature(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.toggleFeature(id);
  }

  @Put(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Xác minh review (admin)' })
  @ApiResponse({ status: 200, description: 'Thành công', type: ReviewResponseDto })
  async toggleVerify(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.toggleVerify(id);
  }
}
