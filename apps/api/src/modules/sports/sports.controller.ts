import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { CreateSportDto, UpdateSportDto } from './dto';
import { Sport } from '../../entities/sport.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sports' })
  @ApiResponse({ status: 200, description: 'Danh sách sports', type: [Sport] })
  async findAll(): Promise<Sport[]> {
    return this.sportsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sport theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin sport', type: Sport })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Sport> {
    return this.sportsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin sport theo slug' })
  @ApiResponse({ status: 200, description: 'Thông tin sport', type: Sport })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findBySlug(@Param('slug') slug: string): Promise<Sport> {
    return this.sportsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sport mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo sport thành công', type: Sport })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(@Body() dto: CreateSportDto): Promise<Sport> {
    return this.sportsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật sport (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: Sport })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSportDto,
  ): Promise<Sport> {
    return this.sportsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sport (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.sportsService.delete(id);
  }
}
