# PHASE 5: Booking Module

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Booking DTOs](#booking-dtos)
3. [Booking Service](#booking-service)
4. [Booking Controller](#booking-controller)
5. [API Endpoints](#api-endpoints)
6. [Booking Status Flow](#booking-status-flow)
7. [Testing](#testing)
8. [Review Checklist](#review-checklist)

---

## Tổng Quan

### Mục tiêu Phase 5

- [x] Tạo booking mới
- [x] Check availability (kiểm tra khung giờ trống)
- [x] Booking confirmation (xác nhận booking)
- [x] QR code generation
- [x] Check-in/Check-out
- [x] Cancel booking
- [x] Complete booking

### Timeline

**Ước tính:** 60-90 phút

### Prerequisites

- Phase 1 hoàn thành (NestJS setup)
- Phase 2 hoàn thành (Database & Entities)
- Phase 3 hoàn thành (Auth Module)
- Phase 4 hoàn thành (Court Module)

---

## Booking DTOs

### Create Booking DTO

```typescript
// apps/api/src/modules/bookings/dto/create-booking.dto.ts
export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  courtId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  sportId?: number;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  playerCount?: number;

  @ApiPropertyOptional({ example: 'Cần thuê vợt' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  playerName?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  playerPhone?: string;
}
```

### Booking Query DTO

```typescript
// apps/api/src/modules/bookings/dto/booking-query.dto.ts
export class BookingQueryDto {
  @IsOptional()
  courtId?: string;

  @IsOptional()
  userId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(100)
  limit?: number = 20;
}
```

### Booking Response DTO

```typescript
// apps/api/src/modules/bookings/dto/booking-response.dto.ts
export class BookingResponseDto {
  id: string;
  bookingCode: string;
  userId: string;
  courtId: string;
  sportId?: number;
  ownerId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  totalPaid: number;
  status: string;
  qrCode?: string;
  qrVerifiedAt?: Date;
  playerName?: string;
  playerPhone?: string;
  playerCount: number;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AvailabilityResponseDto {
  date: string;
  courtId: string;
  slots: TimeSlotDto[];
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
}
```

---

## Booking Service

### BookingsService

```typescript
// apps/api/src/modules/bookings/bookings.service.ts
@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
  ) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    // 1. Validate court exists & active
    // 2. Check slot availability
    // 3. Calculate price (weekend, peak hour)
    // 4. Generate booking code & QR code
    // 5. Create booking
    // 6. Update court stats
  }

  async findAll(query: BookingQueryDto): Promise<BookingListResponseDto> { /* ... */ }
  async findOne(id: string): Promise<BookingResponseDto> { /* ... */ }
  async findByCode(code: string): Promise<BookingResponseDto> { /* ... */ }
  async findByUser(userId: string, page, limit): Promise<BookingListResponseDto> { /* ... */ }
  async findByCourt(courtId: string, page, limit): Promise<BookingListResponseDto> { /* ... */ }
  async cancel(id, userId, reason?): Promise<BookingResponseDto> { /* ... */ }
  async confirm(bookingId, ownerId): Promise<BookingResponseDto> { /* ... */ }
  async checkIn(bookingId, ownerId): Promise<BookingResponseDto> { /* ... */ }
  async complete(bookingId, ownerId): Promise<BookingResponseDto> { /* ... */ }
  async verifyQR(qrCode, ownerId): Promise<BookingResponseDto> { /* ... */ }
  async getAvailability(courtId, date): Promise<AvailabilityResponseDto> { /* ... */ }
  async checkSlotAvailability(courtId, date, startTime, endTime): Promise<boolean> { /* ... */ }
}
```

---

## Booking Controller

### BookingsController

```typescript
// apps/api/src/modules/bookings/bookings.controller.ts
@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  @Post()
  async create(@CurrentUser() user, @Body() dto: CreateBookingDto) { /* ... */ }

  @Get()
  async findAll(@Query() query: BookingQueryDto) { /* ... */ }

  @Get('my-bookings')
  async getMyBookings(@CurrentUser() user, @Query() query) { /* ... */ }

  @Get('court/:courtId')
  async getCourtBookings(@Param('courtId') courtId, @Query() query) { /* ... */ }

  @Get('availability/:courtId')
  async getAvailability(@Param('courtId') courtId, @Query('date') date) { /* ... */ }

  @Get('code/:code')
  async findByCode(@Param('code') code) { /* ... */ }

  @Get(':id')
  async findById(@Param('id') id) { /* ... */ }

  @Put(':id/cancel')
  async cancel(@Param('id') id, @CurrentUser() user, @Body('reason') reason?) { /* ... */ }

  @Put(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  async confirm(@Param('id') id, @CurrentUser() user) { /* ... */ }

  @Put(':id/check-in')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  async checkIn(@Param('id') id, @CurrentUser() user) { /* ... */ }

  @Put(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  async complete(@Param('id') id, @CurrentUser() user) { /* ... */ }

  @Post('verify-qr')
  @UseGuards(RolesGuard)
  @Roles('court_owner', 'admin', 'super_admin')
  async verifyQR(@Body('qrCode') qrCode, @CurrentUser() user) { /* ... */ }
}
```

---

## API Endpoints

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/bookings` | Tạo booking mới | Required |
| GET | `/bookings` | Danh sách bookings (admin) | Admin |
| GET | `/bookings/my-bookings` | Booking của tôi | Required |
| GET | `/bookings/court/:courtId` | Booking theo sân | Public |
| GET | `/bookings/availability/:courtId` | Kiểm tra khung giờ trống | Public |
| GET | `/bookings/code/:code` | Tìm booking theo mã | Required |
| GET | `/bookings/:id` | Chi tiết booking | Required |
| PUT | `/bookings/:id/cancel` | Hủy booking | Owner |
| PUT | `/bookings/:id/confirm` | Xác nhận booking | Court Owner |
| PUT | `/bookings/:id/check-in` | Check-in booking | Court Owner |
| PUT | `/bookings/:id/complete` | Hoàn thành booking | Court Owner |
| POST | `/bookings/verify-qr` | Xác minh QR code | Court Owner |

---

## Booking Status Flow

```
┌─────────────────┐
│ PENDING_PAYMENT │  (Booking created, awaiting payment)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ PENDING_CONFIRMATION   │  (Payment received, awaiting court owner confirmation)
└────────┬────────────────┘
         │
         ▼
┌───────────────┐
│  CONFIRMED   │  (Court owner confirmed)
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  CHECKED_IN  │  (Customer arrived, scan QR code)
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  COMPLETED   │  (Match/play finished)
└───────────────┘

Alternative flows:
- CANCELLED: User or admin cancels
- NO_SHOW: Customer didn't arrive
- REFUNDED: Payment was refunded
```

---

## Testing

### 1. Check Availability

```bash
curl -X GET "http://localhost:3000/api/v1/bookings/availability/COURT_ID?date=2026-05-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "date": "2026-05-15",
  "courtId": "...",
  "slots": [
    { "startTime": "06:00", "endTime": "07:00", "available": true, "price": 150000 },
    { "startTime": "07:00", "endTime": "08:00", "available": false, "price": 150000 },
    ...
  ],
  "openTime": "06:00",
  "closeTime": "22:00",
  "slotDuration": 60
}
```

### 2. Create Booking

```bash
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courtId": "COURT_ID",
    "bookingDate": "2026-05-15",
    "startTime": "08:00",
    "endTime": "09:00",
    "playerCount": 1,
    "notes": "Cần thuê vợt"
  }'
```

Response:
```json
{
  "id": "...",
  "bookingCode": "BKXXXXXX",
  "status": "pending_payment",
  "finalPrice": 150000,
  "depositAmount": 45000,
  "qrCode": "Qms...",
  ...
}
```

### 3. Verify QR Code

```bash
curl -X POST http://localhost:3000/api/v1/bookings/verify-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer COURT_OWNER_TOKEN" \
  -d '{"qrCode": "Qms..."}'
```

### 4. Swagger Testing

Mở http://localhost:3000/docs và test các endpoints:

1. **GET /bookings/availability/:courtId** - Kiểm tra khung giờ trống
2. **POST /bookings** - Tạo booking mới
3. **GET /bookings/my-bookings** - Xem booking của tôi
4. **PUT /bookings/:id/cancel** - Hủy booking
5. **PUT /bookings/:id/confirm** - Xác nhận booking (court owner)
6. **PUT /bookings/:id/check-in** - Check-in booking
7. **POST /bookings/verify-qr** - Xác minh QR code

---

## Review Checklist

### Phase 5 Complete Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Tạo Booking DTOs | ✅ | create, query, response |
| 2 | Tạo Booking Service | ✅ | CRUD, availability, pricing |
| 3 | Tạo Booking Controller | ✅ | All endpoints |
| 4 | Cập nhật AppModule | ✅ | Import module |
| 5 | Test Check Availability | ⬜ | |
| 6 | Test Create Booking | ⬜ | |
| 7 | Test Cancel Booking | ⬜ | |
| 8 | Test Confirm/Check-in/Complete | ⬜ | |
| 9 | Test QR Verification | ⬜ | |

### Questions for Review

Trước khi qua Phase 6, hãy xác nhận:

1. ✅ Booking tạo được với mã booking
2. ✅ Availability check hoạt động
3. ✅ Pricing tính đúng (weekend, peak hour)
4. ✅ QR code được tạo
5. ✅ Status flow hoạt động đúng
6. ✅ Swagger docs hiển thị đúng

---

## Next Steps

Sau khi Phase 5 hoàn thành và được review:

➡️ **Phase 6: Match Module**
- Tạo match/lên kèo
- Join match
- Match chat
- Match completion

➡️ **Phase 7: Review Module**
- Tạo review sau khi booking completed
- Vote review
- Report review

---

## Price Calculation Logic

```typescript
// Weekend pricing
const isWeekend = date.getDay() === 0 || date.getDay() === 6;
if (isWeekend && court.weekendPrice) {
  pricePerHour = court.weekendPrice;
}

// Peak hour pricing (17:00 - 21:00)
const isPeakHour = hour >= 17 && hour <= 21;
if (isPeakHour && court.peakHourPrice) {
  pricePerHour = court.peakHourPrice;
}

// Final price
finalPrice = pricePerHour * (durationMinutes / 60);
```

---

**Version:** 1.0
**Last Updated:** 2026-05-11
