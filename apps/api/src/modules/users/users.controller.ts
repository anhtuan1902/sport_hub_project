import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateProfileDto,
  UpdateAvatarDto,
  UserQueryDto,
  UserResponseDto,
  UserProfileDto,
  UserPublicProfileDto,
  UserListResponseDto,
  UserStatsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Admin)' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng', type: UserListResponseDto })
  async findAll(@Query() query: UserQueryDto): Promise<UserListResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Thông tin profile', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getMe(@CurrentUser() user: CurrentUserData): Promise<UserProfileDto> {
    return this.usersService.getProfile(user.id);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Thống kê người dùng', type: UserStatsDto })
  async getMyStats(@CurrentUser() user: CurrentUserData): Promise<UserStatsDto> {
    return this.usersService.getUserStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return this.usersService.toUserResponse(user);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Lấy thông tin công khai của người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin công khai', type: UserPublicProfileDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async getPublicProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserPublicProfileDto> {
    return this.usersService.getPublicProfile(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê người dùng' })
  @ApiResponse({ status: 200, description: 'Thống kê người dùng', type: UserStatsDto })
  async getUserStats(@Param('id', ParseUUIDPipe) id: string): Promise<UserStatsDto> {
    return this.usersService.getUserStats(id);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Thông tin đã được cập nhật', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 409, description: 'Số điện thoại đã được sử dụng' })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật avatar' })
  @ApiResponse({ status: 200, description: 'Avatar đã được cập nhật', type: UserProfileDto })
  async updateAvatar(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateAvatarDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateAvatar(user.id, dto.avatarUrl);
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra email đã tồn tại chưa' })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra' })
  async checkEmail(
    @Body('email') email: string,
  ): Promise<{ exists: boolean }> {
    return this.usersService.checkEmailExists(email);
  }

  @Post('check-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra số điện thoại đã tồn tại chưa' })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra' })
  async checkPhone(
    @Body('phone') phone: string,
  ): Promise<{ exists: boolean }> {
    return this.usersService.checkPhoneExists(phone);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vô hiệu hóa tài khoản (Admin)' })
  @ApiResponse({ status: 200, description: 'Tài khoản đã bị vô hiệu hóa' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.usersService.deactivateUser(id, user.id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kích hoạt tài khoản (Admin)' })
  @ApiResponse({ status: 200, description: 'Tài khoản đã được kích hoạt' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.usersService.activateUser(id, user.id);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cấm tài khoản (Admin)' })
  @ApiResponse({ status: 200, description: 'Tài khoản đã bị cấm' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.usersService.banUser(id, user.id);
  }

  @Post(':id/unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mở cấm tài khoản (Admin)' })
  @ApiResponse({ status: 200, description: 'Tài khoản đã được mở cấm' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async unbanUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.usersService.unbanUser(id, user.id);
  }
}
