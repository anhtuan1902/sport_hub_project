# Hướng Dẫn Khởi Tạo Project Sport Hub

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Cài Đặt Từng Bước](#cài-đặt-từng-bước)
4. [Cấu Trúc Project](#cấu-trúc-project)
5. [Chạy Ứng Dụng](#chạy-ứng-dụng)
6. [Các Bước Tiếp Theo](#các-bước-tiếp-theo)

---

## Tổng Quan

**Sport Hub** là một ứng dụng thể thao kết nối:
- **Chủ sân** - Quản lý và cho thuê sân thể thao
- **Người chơi** - Tìm và đặt sân dễ dàng
- **Cộng đồng** - Lên kèo, giao lưu, kết bạn

### Kiến Trúc Monorepo

```
sport-hub/
├── apps/
│   ├── api/          # Backend API (NestJS)
│   └── mobile/       # Mobile App (React Native/Expo)
├── packages/
│   └── shared/       # Shared types, constants
├── infrastructure/
│   └── docker/       # Docker containers
└── docs/             # Documentation
```

---

## Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết

| Phần Mềm | Phiên Bản | Mục Đích |
|----------|-----------|----------|
| Node.js | >= 20.0.0 | Runtime cho backend |
| npm | >= 10.0.0 | Package manager |
| Docker Desktop | Latest | Chạy PostgreSQL, Redis |
| Git | Latest | Version control |
| VS Code | Latest | Code editor (khuyến nghị) |

### Kiểm Tra Phiên Bản

```bash
# Kiểm tra Node.js
node --version
# Output: v20.x.x

# Kiểm tra npm
npm --version
# Output: 10.x.x

# Kiểm tra Docker
docker --version
# Output: Docker version 24.x.x

# Kiểm tra Git
git --version
# Output: git version 2.x.x
```

---

## Cài Đặt Từng Bước

### Bước 1: Cài Đặt NestJS CLI

NestJS CLI là công cụ dòng lệnh để tạo và quản lý project NestJS.

```bash
# Cài đặt globally
npm install -g @nestjs/cli

# Kiểm tra cài đặt
nest --version
```

### Bước 2: Tạo Cấu Trúc Thư Mục

```bash
# Di chuyển vào thư mục dự án
cd c:\MyCode\sport_hub_project

# Tạo cấu trúc monorepo
mkdir -p apps/mobile
mkdir -p apps/api
mkdir -p packages/shared
mkdir -p infrastructure/docker
mkdir -p docs
```

### Bước 3: Khởi Tạo Root Project

Tạo file `package.json` ở thư mục gốc:

```json
{
  "name": "sport-hub",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "dev:api": "cd apps/api && npm run start:dev",
    "dev:mobile": "cd apps/mobile && npx expo start",
    "db:start": "cd infrastructure/docker && docker-compose up -d",
    "db:migrate": "cd apps/api && npm run migration:run"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### Bước 4: Tạo Turbo Config

Tạo file `turbo.json` ở thư mục gốc:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

### Bước 5: Khởi Tạo Backend (NestJS)

```bash
# Di chuyển vào thư mục api
cd apps/api

# Khởi tạo NestJS project
nest new . --skip-git --package-manager npm --strict
```

**Lưu ý:** Nếu gặp lỗi "Directory not empty", xóa trước rồi chạy lại:

```bash
# Xóa và tạo lại
rm -rf apps/api
cd ..
nest new apps/api --skip-git --package-manager npm --strict
```

### Bước 6: Cài Dependencies Cho Backend

Cài **từng nhóm** dependencies sau (đừng cài tất cả cùng lúc):

**Core Dependencies:**
```bash
cd apps/api
npm install @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport
```

**Database:**
```bash
npm install pg typeorm
```

**Authentication:**
```bash
npm install passport passport-jwt passport-local bcrypt
```

**Validation & Documentation:**
```bash
npm install class-validator class-transformer @nestjs/swagger swagger-ui-express
```

**Real-time (Socket.io):**
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Utilities:**
```bash
npm install joi uuid rxjs
```

**Dev Dependencies:**
```bash
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt @types/uuid
```

### Bước 7: Khởi Tạo Shared Package

```bash
cd packages/shared
npm init -y
```

Cập nhật `packages/shared/package.json`:

```json
{
  "name": "@sport-hub/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "date-fns": "^3.3.0",
    "zod": "^3.22.4"
  }
}
```

Cài đặt:
```bash
npm install
```

### Bước 8: Tạo File Cấu Hình Cho Shared Package

**`packages/shared/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`packages/shared/src/index.ts`:**
```typescript
// Shared types and utilities

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Sports Constants
export const SPORTS = [
  { id: 1, name: 'Bóng đá 5', slug: 'football-5', icon: '⚽' },
  { id: 2, name: 'Cầu lông', slug: 'badminton', icon: '🏸' },
  { id: 3, name: 'Tennis', slug: 'tennis', icon: '🎾' },
  { id: 4, name: 'Bóng rổ', slug: 'basketball', icon: '🏀' },
  { id: 5, name: 'Pickleball', slug: 'pickleball', icon: '🏓' },
  { id: 6, name: 'Bóng chuyền', slug: 'volleyball', icon: '🏐' },
] as const;

// Amenities Constants  
export const AMENITIES = [
  { id: 1, name: 'Máy lạnh', slug: 'air_conditioner', icon: '❄️' },
  { id: 2, name: 'WiFi', slug: 'wifi', icon: '📶' },
  { id: 3, name: 'Chỗ để xe', slug: 'parking', icon: '🅿️' },
  { id: 4, name: 'Phòng thay đồ', slug: 'changing_room', icon: '🚿' },
  { id: 5, name: 'Nước uống', slug: 'drinking_water', icon: '💧' },
] as const;

// User Ranks
export const USER_RANKS = [
  { id: 1, name: 'Tân binh', slug: 'rookie', minMatches: 0, color: '#9CA3AF' },
  { id: 2, name: 'Nghiệp dư', slug: 'amateur', minMatches: 6, color: '#22C55E' },
  { id: 3, name: 'Chuyên nghiệp', slug: 'pro', minMatches: 21, color: '#3B82F6' },
] as const;
```

Build shared package:
```bash
cd packages/shared
npm run build
```

### Bước 9: Cài Đặt Docker

Tạo file `infrastructure/docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sport-hub-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_DB: sport_hub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sport-hub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

### Bước 10: Tạo File Môi Trường

Tạo file `apps/api/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/sport_hub
JWT_SECRET=your-super-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d
```

### Bước 11: Cập Nhật API Config

Cập nhật `apps/api/tsconfig.json` để nhận shared package:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../../packages/shared/src/*"]
    }
  }
}
```

---

## Cấu Trúc Project

### Sau Khi Hoàn Thành Setup

```
sport-hub/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   └── modules/           # Các module sẽ thêm sau
│       ├── test/
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── .env
│
├── packages/
│   └── shared/
│       ├── src/
│       │   └── index.ts
│       ├── dist/                  # Generated sau khi build
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml
│
├── docs/
├── package.json
├── turbo.json
└── README.md
```

### Cấu Trúc Backend Chi Tiết (Sau Khi Thêm Modules)

```
apps/api/src/
├── main.ts                    # Entry point
├── app.module.ts              # Root module
├── config/
│   └── configuration.ts       # Config loader
├── common/
│   ├── filters/
│   ├── interceptors/
│   └── decorators/
├── modules/
│   ├── auth/                  # Authentication
│   ├── users/                 # User management
│   ├── courts/                # Court management
│   ├── bookings/              # Booking system
│   ├── matches/               # Match/Lên kèo
│   ├── payments/              # Payment integration
│   ├── notifications/         # Push notifications
│   ├── social/                # Social features
│   └── reviews/               # Reviews & ratings
└── database/
    ├── migrations/
    └── seeds/
```

---

## Chạy Ứng Dụng

### Khởi Động Database

```bash
cd infrastructure/docker
docker-compose up -d

# Kiểm tra containers đang chạy
docker ps
```

**Output mong đợi:**
```
CONTAINER ID   IMAGE            STATUS
abc123         postgres:15      Up 2 minutes
def456         redis:7-alpine   Up 2 minutes
```

### Khởi Động Backend

```bash
cd apps/api
npm run start:dev
```

**Output mong đợi:**
```
🚀 Server is running on http://localhost:3000
📚 Swagger docs at http://localhost:3000/docs
```

### Kiểm Tra API

Mở trình duyệt và truy cập:
- **API Base:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/docs

---

## Các Bước Tiếp Theo

### Phase 1: Core Features (Ưu tiên cao)

| STT | Module | Mô Tả |
|-----|--------|--------|
| 1 | User Entity | Bảng người dùng |
| 2 | Auth Module | Đăng ký, đăng nhập, JWT |
| 3 | Court Entity | Bảng sân thể thao |
| 4 | Court CRUD | Tạo, đọc, cập nhật, xóa sân |
| 5 | Booking Module | Hệ thống đặt sân |

### Phase 2: Payments & QR (Ưu tiên cao)

| STT | Module | Mô Tả |
|-----|--------|--------|
| 6 | Payment Integration | VNPay, MoMo |
| 7 | QR Code | Tạo & xác thực QR |

### Phase 3: Social Features (Ưu tiên trung bình)

| STT | Module | Mô Tả |
|-----|--------|--------|
| 8 | Match Module | Lên kèo, tìm đối |
| 9 | Chat | Trò chuyện real-time |
| 10 | Reviews | Đánh giá sân |

### Phase 4: Advanced (Ưu tiên thấp)

| STT | Module | Mô Tả |
|-----|--------|--------|
| 11 | Social/Blog | Bài viết, feed |
| 12 | Gamification | Points, badges, ranks |
| 13 | Admin Dashboard | Quản lý hệ thống |

---

## Troubleshooting

### Lỗi Thường Gặp

**1. Lỗi "Directory not empty" khi chạy nest new:**
```bash
rm -rf apps/api
nest new apps/api --skip-git --package-manager npm --strict
```

**2. Lỗi Docker không chạy:**
- Kiểm tra Docker Desktop đã bật chưa
- Restart Docker Desktop

**3. Lỗi kết nối database:**
- Kiểm tra DATABASE_URL trong .env
- Đảm bảo PostgreSQL container đang chạy

**4. Lỗi module not found:**
```bash
cd apps/api
npm rebuild
```

---

## Checklist Hoàn Thành

| Bước | Nhiệm Vụ | Status |
|------|----------|--------|
| 1 | Cài NestJS CLI | ⬜ |
| 2 | Tạo cấu trúc thư mục | ⬜ |
| 3 | Tạo root package.json | ⬜ |
| 4 | Tạo turbo.json | ⬜ |
| 5 | Khởi tạo NestJS project | ⬜ |
| 6 | Cài dependencies | ⬜ |
| 7 | Setup shared package | ⬜ |
| 8 | Cài Docker | ⬜ |
| 9 | Tạo .env | ⬜ |
| 10 | Chạy thử backend | ⬜ |

---

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra lại các bước đã làm
2. Đọc phần Troubleshooting
3. Liên hệ team phát triển

**Version:** 1.0.0  
**Last Updated:** 2026-05-09
