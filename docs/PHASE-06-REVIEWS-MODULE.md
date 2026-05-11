# Phase 6: Reviews Module

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Module Structure](#module-structure)
4. [API Endpoints](#api-endpoints)
5. [Business Rules](#business-rules)
6. [Response DTOs](#response-dtos)

---

## Tổng quan

Module Reviews cho phép người dùng đánh giá và nhận xét về các sân thể thao sau khi hoàn thành booking. Hệ thống hỗ trợ:

- Đánh giá đa tiêu chí (overall, court, service, location, price)
- Upload hình ảnh kèm review
- Vote hữu ích/báo cáo review
- Phản hồi từ chủ sân
- Quản lý bởi admin

---

## Database Schema

### Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    court_id UUID NOT NULL,
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    court_rating INT CHECK (court_rating BETWEEN 1 AND 5),
    service_rating INT CHECK (service_rating BETWEEN 1 AND 5),
    location_rating INT CHECK (location_rating BETWEEN 1 AND 5),
    price_rating INT CHECK (price_rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT,
    images JSONB DEFAULT '[]',
    helpful_count INT DEFAULT 0,
    report_count INT DEFAULT 0,
    is_reported BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_court ON reviews(court_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### Review Votes Table

```sql
CREATE TABLE review_votes (
    review_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    PRIMARY KEY (review_id, user_id)
);
```

---

## Module Structure

```
src/modules/reviews/
├── dto/
│   ├── index.ts
│   └── reviews.dto.ts
├── index.ts
├── reviews.controller.ts
├── reviews.module.ts
└── reviews.service.ts
```

---

## API Endpoints

### Public Endpoints (Không cần auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reviews` | Danh sách reviews (admin) |
| GET | `/reviews/court/:courtId` | Reviews của một sân |
| GET | `/reviews/court/:courtId/summary` | Tổng hợp reviews sân |
| GET | `/reviews/booking/:bookingId` | Review của một booking |
| GET | `/reviews/:id` | Chi tiết review |

### Protected Endpoints (Cần auth)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/reviews` | Tạo review mới | USER |
| GET | `/reviews/user/me` | Reviews của tôi | USER |
| PUT | `/reviews/:id` | Cập nhật review | USER (owner) |
| DELETE | `/reviews/:id` | Xóa review | USER (owner) |
| POST | `/reviews/:id/helpful` | Đánh dấu hữu ích | USER |
| DELETE | `/reviews/:id/helpful` | Bỏ đánh dấu hữu ích | USER |
| POST | `/reviews/:id/report` | Báo cáo review | USER |
| PUT | `/reviews/:id/respond` | Phản hồi review | COURT_OWNER, ADMIN |
| PUT | `/reviews/:id/feature` | Đánh dấu nổi bật | ADMIN |
| PUT | `/reviews/:id/verify` | Xác minh review | ADMIN |

---

## Business Rules

### 1. Tạo Review

**Điều kiện:**
- Booking phải tồn tại và thuộc về user đang đăng nhập
- Booking phải có trạng thái `COMPLETED`
- Chỉ được tạo 1 review cho mỗi booking
- `overallRating` bắt buộc (1-5)
- Các rating khác optional

**Validation:**
```typescript
{
  bookingId: UUID (required),
  overallRating: number 1-5 (required),
  courtRating?: number 1-5,
  serviceRating?: number 1-5,
  locationRating?: number 1-5,
  priceRating?: number 1-5,
  title?: string maxLength 200,
  content?: string,
  images?: string[]
}
```

**Side Effects:**
- Cập nhật `avgRating` và `totalReviews` của Court

### 2. Cập nhật Review

**Điều kiện:**
- Chỉ chủ review mới được cập nhật
- Có thể cập nhật rating, title, content, images

### 3. Xóa Review

**Điều kiện:**
- Chỉ chủ review mới được xóa

**Side Effects:**
- Cập nhật `avgRating` và `totalReviews` của Court

### 4. Vote Helpful

**Điều kiện:**
- Không thể vote review của chính mình
- Toggle vote (vote lại = bỏ vote)

**Side Effects:**
- Tăng/giảm `helpfulCount` của Review

### 5. Báo cáo Review

**Điều kiện:**
- Không thể báo cáo review của chính mình
- Mỗi user chỉ báo cáo 1 lần

**Side Effects:**
- Tăng `reportCount` của Review
- Tự động đánh dấu `isReported = true` khi `reportCount >= 3`

### 6. Phản hồi Review (Court Owner)

**Điều kiện:**
- Chỉ chủ sân hoặc admin mới được phản hồi
- Lưu `adminResponse` và `respondedAt`

### 7. Sort Options cho Court Reviews

| Sort | Description |
|------|-------------|
| `newest` (default) | Mới nhất |
| `oldest` | Cũ nhất |
| `highest` | Điểm cao nhất |
| `lowest` | Điểm thấp nhất |
| `helpful` | Hữu ích nhất |

---

## Response DTOs

### ReviewResponseDto

```typescript
{
  id: string;
  bookingId: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  courtId: string;
  overallRating: number;
  courtRating?: number;
  serviceRating?: number;
  locationRating?: number;
  priceRating?: number;
  title?: string;
  content?: string;
  images: string[];
  helpfulCount: number;
  reportCount: number;
  isReported: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  adminResponse?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### CourtReviewSummaryDto

```typescript
{
  courtId: string;
  courtName: string;
  avgOverallRating: number;
  avgCourtRating: number;
  avgServiceRating: number;
  avgLocationRating: number;
  avgPriceRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;  // Số review 1 sao
    2: number;  // Số review 2 sao
    3: number;  // Số review 3 sao
    4: number;  // Số review 4 sao
    5: number;  // Số review 5 sao
  };
}
```

### ReviewListResponseDto

```typescript
{
  data: ReviewResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

---

## Query Parameters

### ReviewQueryDto (Admin)

| Parameter | Type | Description |
|-----------|------|-------------|
| courtId | UUID | Filter theo court |
| userId | UUID | Filter theo user |
| isVerified | boolean | Filter theo trạng thái xác minh |
| isFeatured | boolean | Filter theo nổi bật |
| isReported | boolean | Filter theo bị báo cáo |
| page | number | Trang (default: 1) |
| limit | number | Số lượng/trang (default: 20) |

### Court Reviews (GET /reviews/court/:courtId)

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Trang (default: 1) |
| limit | number | Số lượng/trang (default: 20) |
| sort | string | Sắp xếp: newest, oldest, highest, lowest, helpful |

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Dữ liệu không hợp lệ |
| 403 | Không có quyền |
| 404 | Review/Không tìm thấy |
| 409 | Đã có review cho booking này |

---

## Example API Calls

### Tạo Review

```bash
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid-của-booking",
  "overallRating": 5,
  "courtRating": 5,
  "serviceRating": 4,
  "locationRating": 4,
  "priceRating": 3,
  "title": "Sân rất tốt!",
  "content": "Sân mới, thiết bị đầy đủ, nhân viên nhiệt tình",
  "images": ["https://example.com/img1.jpg"]
}
```

### Lấy Summary của sân

```bash
GET /reviews/court/550e8400-e29b-41d4-a716-446655440000/summary
```

**Response:**
```json
{
  "courtId": "550e8400-e29b-41d4-a716-446655440000",
  "courtName": "Sân Tennis ABC",
  "avgOverallRating": 4.5,
  "avgCourtRating": 4.7,
  "avgServiceRating": 4.3,
  "avgLocationRating": 4.2,
  "avgPriceRating": 3.8,
  "totalReviews": 125,
  "ratingDistribution": {
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 40,
    "5": 50
  }
}
```

### Đánh dấu hữu ích

```bash
POST /reviews/550e8400-e29b-41d4-a716-446655440001/helpful
Authorization: Bearer <token>
```

### Báo cáo Review

```bash
POST /reviews/550e8400-e29b-41d4-a716-446655440001/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Nội dung không phù hợp"
}
```

### Phản hồi Review (Court Owner)

```bash
PUT /reviews/550e8400-e29b-41d4-a716-446655440001/respond
Authorization: Bearer <court_owner_token>
Content-Type: application/json

{
  "response": "Cảm ơn bạn đã đánh giá! Chúng tôi sẽ cải thiện dịch vụ."
}
```

---

## Next Steps

Sau khi hoàn thành Phase 6, tiếp tục với:

- **Phase 7: Match Module** - Tạo và quản lý trận đấu giữa người chơi
- **Phase 8: Notifications Module** - Gửi thông báo cho users
