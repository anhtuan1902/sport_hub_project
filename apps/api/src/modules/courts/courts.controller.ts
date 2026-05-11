import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseFloatPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import {
  CreateCourtDto,
  UpdateCourtDto,
  CourtQueryDto,
  CourtResponseDto,
  CourtListResponseDto,
  AddCourtImageDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Courts')
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sân mới' })
  @ApiResponse({ status: 201, description: 'Tạo sân thành công', type: CourtResponseDto })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.courtsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sân' })
  @ApiResponse({ status: 200, description: 'Danh sách sân', type: CourtListResponseDto })
  async findAll(@Query() query: CourtQueryDto): Promise<CourtListResponseDto> {
    return this.courtsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Lấy danh sách sân nổi bật' })
  @ApiResponse({ status: 200, description: 'Danh sách sân nổi bật', type: [CourtResponseDto] })
  async getFeatured(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<CourtResponseDto[]> {
    return this.courtsService.getFeaturedCourts(limit);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Tìm sân gần bạn' })
  @ApiQuery({ name: 'lat', required: true, example: 10.8231 })
  @ApiQuery({ name: 'lng', required: true, example: 106.6292 })
  @ApiQuery({ name: 'radius', required: false, example: 10 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Danh sách sân gần đó', type: [CourtResponseDto] })
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', new DefaultValuePipe(10), ParseIntPipe) radius: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<CourtResponseDto[]> {
    return this.courtsService.getNearbyCourts(lat, lng, radius, limit);
  }

  @Get('my-courts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách sân của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách sân', type: CourtListResponseDto })
  async getMyCourts(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<CourtListResponseDto> {
    return this.courtsService.findByOwner(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sân theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin sân', type: CourtResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<CourtResponseDto> {
    return this.courtsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin sân theo slug' })
  @ApiResponse({ status: 200, description: 'Thông tin sân', type: CourtResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findBySlug(@Param('slug') slug: string): Promise<CourtResponseDto> {
    return this.courtsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin sân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: CourtResponseDto })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.courtsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sân' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.courtsService.delete(id, user.id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm hình ảnh cho sân' })
  @ApiResponse({ status: 201, description: 'Thêm hình ảnh thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AddCourtImageDto,
  ) {
    return this.courtsService.addImage(
      id,
      user.id,
      dto.url,
      dto.caption,
      dto.type,
      dto.sortOrder,
    );
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa hình ảnh sân' })
  @ApiResponse({ status: 200, description: 'Xóa hình ảnh thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.courtsService.deleteImage(id, imageId, user.id);
  }
}
