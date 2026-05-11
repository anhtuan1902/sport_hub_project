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
import { AmenitiesService } from './amenities.service';
import { CreateAmenityDto, UpdateAmenityDto } from './dto';
import { Amenity } from '../../entities/amenity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Amenities')
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả amenities' })
  @ApiResponse({ status: 200, description: 'Danh sách amenities', type: [Amenity] })
  async findAll(): Promise<Amenity[]> {
    return this.amenitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin amenity theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin amenity', type: Amenity })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Amenity> {
    return this.amenitiesService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin amenity theo slug' })
  @ApiResponse({ status: 200, description: 'Thông tin amenity', type: Amenity })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async findBySlug(@Param('slug') slug: string): Promise<Amenity> {
    return this.amenitiesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo amenity mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo amenity thành công', type: Amenity })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(@Body() dto: CreateAmenityDto): Promise<Amenity> {
    return this.amenitiesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật amenity (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: Amenity })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAmenityDto,
  ): Promise<Amenity> {
    return this.amenitiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa amenity (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.amenitiesService.delete(id);
  }
}
