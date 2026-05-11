# PHASE 4: Court Module

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Court DTOs](#court-dtos)
4. [Court Service](#court-service)
5. [Court Controller](#court-controller)
6. [Sport Module](#sport-module)
7. [Amenity Module](#amenity-module)
8. [Cập nhật AppModule](#cập-nhật-appmodule)
9. [API Endpoints](#api-endpoints)
10. [Testing](#testing)
11. [Review Checklist](#review-checklist)

---

## Tổng Quan

### Mục tiêu Phase 4

- [x] Court CRUD cho chủ sân
- [x] Court search và filter (theo sport, location, giá, amenities)
- [x] Court images management
- [x] Sport CRUD (Admin)
- [x] Amenity CRUD (Admin)
- [x] Featured courts
- [x] Nearby courts (Geolocation)

### Timeline

**Ước tính:** 60-90 phút

### Prerequisites

- Phase 1 hoàn thành (NestJS setup)
- Phase 2 hoàn thành (Database & Entities)
- Phase 3 hoàn thành (Auth Module)

---

## Cấu Trúc Thư Mục

```
apps/api/src/
├── modules/
│   ├── courts/
│   │   ├── dto/
│   │   │   ├── create-court.dto.ts
│   │   │   ├── update-court.dto.ts
│   │   │   ├── court-query.dto.ts
│   │   │   ├── court-response.dto.ts
│   │   │   └── index.ts
│   │   ├── courts.controller.ts
│   │   ├── courts.service.ts
│   │   ├── courts.module.ts
│   │   └── index.ts
│   ├── sports/
│   │   ├── dto/
│   │   │   ├── create-sport.dto.ts
│   │   │   ├── update-sport.dto.ts
│   │   │   └── index.ts
│   │   ├── sports.controller.ts
│   │   ├── sports.service.ts
│   │   ├── sports.module.ts
│   │   └── index.ts
│   └── amenities/
│       ├── dto/
│       │   ├── create-amenity.dto.ts
│       │   ├── update-amenity.dto.ts
│       │   └── index.ts
│       ├── amenities.controller.ts
│       ├── amenities.service.ts
│       ├── amenities.module.ts
│       └── index.ts
```

---

## Court DTOs

### Create Court DTO

```typescript
// apps/api/src/modules/courts/dto/create-court.dto.ts
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCourtDto {
  @ApiProperty({ example: 'Sân bóng đá ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Đường Nguyễn Huệ, Quận 1' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Quận 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'hour' })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weekendPrice?: number;

  @ApiPropertyOptional({ example: '06:00' })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  sportIds?: number[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  amenityIds?: number[];
}
```

### Court Query DTO

```typescript
// apps/api/src/modules/courts/dto/court-query.dto.ts
import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { CourtStatus } from '../../../entities/court.entity';

export class CourtQueryDto {
  @ApiPropertyOptional({ example: 'sân bóng' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sportId?: number;

  @ApiPropertyOptional({ example: 'Hồ Chí Minh' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Quận 1' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: '1,2,3' })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiPropertyOptional({ enum: CourtStatus })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;

  @ApiPropertyOptional({ example: 10.8231 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 106.6292 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number;

  @ApiPropertyOptional({ example: 'rating' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

## Court Service

### CourtsService

```typescript
// apps/api/src/modules/courts/courts.service.ts
@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(CourtSport)
    private courtSportRepository: Repository<CourtSport>,
    @InjectRepository(CourtAmenity)
    private courtAmenityRepository: Repository<CourtAmenity>,
    @InjectRepository(CourtImage)
    private courtImageRepository: Repository<CourtImage>,
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async create(ownerId: string, dto: CreateCourtDto): Promise<CourtResponseDto> {
    // Tạo slug unique
    const slug = this.generateSlug(dto.name);
    // ... create court logic
  }

  async findAll(query: CourtQueryDto): Promise<CourtListResponseDto> {
    // Query builder với filters
    // ... search & filter logic
  }

  async findOne(id: string): Promise<CourtResponseDto> { /* ... */ }
  async findBySlug(slug: string): Promise<CourtResponseDto> { /* ... */ }
  async findByOwner(ownerId: string, page, limit): Promise<CourtListResponseDto> { /* ... */ }
  async update(id, ownerId, dto): Promise<CourtResponseDto> { /* ... */ }
  async delete(id, ownerId): Promise<{ message: string }> { /* ... */ }
  async addImage(courtId, ownerId, url, caption?, type?, sortOrder?): Promise<CourtImage> { /* ... */ }
  async deleteImage(courtId, imageId, ownerId): Promise<{ message: string }> { /* ... */ }
  async getFeaturedCourts(limit = 10): Promise<CourtResponseDto[]> { /* ... */ }
  async getNearbyCourts(lat, lng, radiusKm = 10, limit = 20): Promise<CourtResponseDto[]> { /* ... */ }
}
```

---

## Court Controller

### CourtsController

```typescript
// apps/api/src/modules/courts/courts.controller.ts
@ApiTags('Courts')
@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  async create(@CurrentUser() user, @Body() dto: CreateCourtDto) { /* ... */ }

  @Get()
  async findAll(@Query() query: CourtQueryDto) { /* ... */ }

  @Get('featured')
  async getFeatured(@Query('limit') limit: number) { /* ... */ }

  @Get('nearby')
  async getNearby(@Query('lat') lat, @Query('lng') lng, @Query('radius') radius, @Query('limit') limit) { /* ... */ }

  @Get('my-courts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyCourts(@CurrentUser() user, @Query() query) { /* ... */ }

  @Get(':id')
  async findById(@Param('id') id: string) { /* ... */ }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) { /* ... */ }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  async update(@Param('id') id, @CurrentUser() user, @Body() dto) { /* ... */ }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  async delete(@Param('id') id, @CurrentUser() user) { /* ... */ }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  async addImage(@Param('id') id, @CurrentUser() user, @Body() dto) { /* ... */ }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  @ApiBearerAuth()
  async deleteImage(@Param('id') id, @Param('imageId') imageId, @CurrentUser() user) { /* ... */ }
}
```

---

## Sport Module

### SportsService

```typescript
// apps/api/src/modules/sports/sports.service.ts
@Injectable()
export class SportsService {
  constructor(@InjectRepository(Sport) private sportRepository: Repository<Sport>) {}

  async findAll(): Promise<Sport[]> { /* ... */ }
  async findById(id: number): Promise<Sport> { /* ... */ }
  async findBySlug(slug: string): Promise<Sport> { /* ... */ }
  async create(dto: CreateSportDto): Promise<Sport> { /* ... */ }
  async update(id: number, dto: UpdateSportDto): Promise<Sport> { /* ... */ }
  async delete(id: number): Promise<{ message: string }> { /* ... */ }
}
```

### SportsController

```typescript
// apps/api/src/modules/sports/sports.controller.ts
@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  @Get()
  async findAll(): Promise<Sport[]> { /* ... */ }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Sport> { /* ... */ }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Sport> { /* ... */ }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async create(@Body() dto: CreateSportDto): Promise<Sport> { /* ... */ }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async update(@Param('id') id, @Body() dto): Promise<Sport> { /* ... */ }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async delete(@Param('id') id): Promise<{ message: string }> { /* ... */ }
}
```

---

## Amenity Module

### AmenitiesService

```typescript
// apps/api/src/modules/amenities/amenities.service.ts
@Injectable()
export class AmenitiesService {
  constructor(@InjectRepository(Amenity) private amenityRepository: Repository<Amenity>) {}

  async findAll(): Promise<Amenity[]> { /* ... */ }
  async findById(id: number): Promise<Amenity> { /* ... */ }
  async findBySlug(slug: string): Promise<Amenity> { /* ... */ }
  async create(dto: CreateAmenityDto): Promise<Amenity> { /* ... */ }
  async update(id: number, dto: UpdateAmenityDto): Promise<Amenity> { /* ... */ }
  async delete(id: number): Promise<{ message: string }> { /* ... */ }
}
```

### AmenitiesController

```typescript
// apps/api/src/modules/amenities/amenities.controller.ts
@ApiTags('Amenities')
@Controller('amenities')
export class AmenitiesController {
  @Get()
  async findAll(): Promise<Amenity[]> { /* ... */ }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Amenity> { /* ... */ }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Amenity> { /* ... */ }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async create(@Body() dto: CreateAmenityDto): Promise<Amenity> { /* ... */ }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async update(@Param('id') id, @Body() dto): Promise<Amenity> { /* ... */ }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  async delete(@Param('id') id): Promise<{ message: string }> { /* ... */ }
}
```

---

## Cập nhật AppModule

```typescript
// apps/api/src/app.module.ts
import { CourtsModule } from './modules/courts';
import { SportsModule } from './modules/sports';
import { AmenitiesModule } from './modules/amenities';

@Module({
  imports: [
    // ... other modules
    CourtsModule,
    SportsModule,
    AmenitiesModule,
  ],
})
export class AppModule {}
```

---

## API Endpoints

### Courts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/courts` | Tạo sân mới | Required (court_owner+) |
| GET | `/courts` | Danh sách sân (search/filter) | Public |
| GET | `/courts/featured` | Sân nổi bật | Public |
| GET | `/courts/nearby` | Sân gần bạn | Public |
| GET | `/courts/my-courts` | Sân của tôi | Required |
| GET | `/courts/:id` | Chi tiết sân (ID) | Public |
| GET | `/courts/slug/:slug` | Chi tiết sân (slug) | Public |
| PUT | `/courts/:id` | Cập nhật sân | Required (owner+) |
| DELETE | `/courts/:id` | Xóa sân | Required (owner+) |
| POST | `/courts/:id/images` | Thêm hình ảnh | Required (owner+) |
| DELETE | `/courts/:id/images/:imageId` | Xóa hình ảnh | Required (owner+) |

### Sports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/sports` | Danh sách sports | Public |
| GET | `/sports/:id` | Chi tiết sport | Public |
| GET | `/sports/slug/:slug` | Sport theo slug | Public |
| POST | `/sports` | Tạo sport | Admin |
| PUT | `/sports/:id` | Cập nhật sport | Admin |
| DELETE | `/sports/:id` | Xóa sport | Admin |

### Amenities

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/amenities` | Danh sách amenities | Public |
| GET | `/amenities/:id` | Chi tiết amenity | Public |
| GET | `/amenities/slug/:slug` | Amenity theo slug | Public |
| POST | `/amenities` | Tạo amenity | Admin |
| PUT | `/amenities/:id` | Cập nhật amenity | Admin |
| DELETE | `/amenities/:id` | Xóa amenity | Admin |

---

## Testing

### 1. Tạo Court

```bash
curl -X POST http://localhost:3000/api/v1/courts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Sân bóng đá ABC",
    "address": "123 Nguyễn Huệ, Q1",
    "province": "Hồ Chí Minh",
    "district": "Quận 1",
    "basePrice": 150000,
    "priceUnit": "hour",
    "sportIds": [1, 2],
    "amenityIds": [1, 2, 3]
  }'
```

### 2. Search Courts

```bash
# Tìm sân theo sport
curl "http://localhost:3000/api/v1/courts?sportId=1"

# Tìm sân theo location
curl "http://localhost:3000/api/v1/courts?province=HCM&district=Quận 1"

# Tìm sân theo giá
curl "http://localhost:3000/api/v1/courts?minPrice=100000&maxPrice=300000"

# Tìm sân gần bạn
curl "http://localhost:3000/api/v1/courts/nearby?lat=10.8231&lng=106.6292&radius=5"
```

### 3. Featured Courts

```bash
curl "http://localhost:3000/api/v1/courts/featured?limit=5"
```

### 4. Swagger Testing

Mở http://localhost:3000/docs và test các endpoints:

1. **POST /courts** - Tạo sân mới
2. **GET /courts** - Tìm kiếm sân
3. **GET /courts/:id** - Chi tiết sân
4. **PUT /courts/:id** - Cập nhật sân
5. **DELETE /courts/:id** - Xóa sân
6. **POST /courts/:id/images** - Thêm hình ảnh
7. **GET /sports** - Danh sách sports
8. **GET /amenities** - Danh sách amenities

---

## Review Checklist

### Phase 4 Complete Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Cài slugify | ✅ | |
| 2 | Tạo Court DTOs | ✅ | create, update, query, response |
| 3 | Tạo Court Service | ✅ | CRUD, search, featured, nearby |
| 4 | Tạo Court Controller | ✅ | All endpoints |
| 5 | Tạo Sport Module | ✅ | CRUD for Admin |
| 6 | Tạo Amenity Module | ✅ | CRUD for Admin |
| 7 | Cập nhật AppModule | ✅ | Import modules |
| 8 | Test Create Court | ⬜ | |
| 9 | Test Search Courts | ⬜ | |
| 10 | Test Nearby Courts | ⬜ | |
| 11 | Test Featured Courts | ⬜ | |
| 12 | Test Sports CRUD | ⬜ | |
| 13 | Test Amenities CRUD | ⬜ | |

### Questions for Review

Trước khi qua Phase 5, hãy xác nhận:

1. ✅ Court CRUD hoạt động
2. ✅ Court search với filters hoạt động
3. ✅ Geolocation (nearby) hoạt động
4. ✅ Featured courts hoạt động
5. ✅ Sports/Amenities management hoạt động
6. ✅ Swagger docs hiển thị đúng

---

## Next Steps

Sau khi Phase 4 hoàn thành và được review:

➡️ **Phase 5: Booking Module**
- Tạo booking
- Check availability
- Booking confirmation
- QR code generation

➡️ **Phase 6: Match Module**
- Tạo match/lên kèo
- Join match
- Match chat
- Match completion

---

## Security Notes

### Court Access Control

1. **Create**: Chỉ court_owner, admin, super_admin
2. **Update/Delete**: Chỉ owner hoặc admin
3. **Read**: Public access
4. **Images**: Chỉ owner hoặc admin

### Geolocation Privacy

1. Latitude/Longitude chỉ được lưu khi user cho phép
2. Bán kính tìm kiếm mặc định: 10km
3. Tối đa: 100km

---

## Dependencies

```bash
cd apps/api
npm install slugify
```

---

**Version:** 1.0
**Last Updated:** 2026-05-11
