# PHASE 1: Project Setup Hoàn Chỉnh

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Backend Setup](#backend-setup)
3. [Shared Package Setup](#shared-package-setup)
4. [Docker Setup](#docker-setup)
5. [Configuration Files](#configuration-files)
6. [Testing](#testing)
7. [Review Checklist](#review-checklist)

---

## Tổng Quan

### Mục tiêu Phase 1

- [ ] Cài đặt hoàn chỉnh backend NestJS
- [ ] Setup Docker (PostgreSQL + Redis)
- [ ] Cấu hình TypeScript, ESLint, Prettier
- [ ] Build shared package
- [ ] Verify API chạy thành công

### Timeline

**Ước tính:** 30-60 phút

---

## Backend Setup

### 1.1 Cài Dependencies

```bash
cd apps/api
```

**Core Dependencies:**
```bash
npm install @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport
npm install @nestjs/swagger @nestjs/websockets @nestjs/platform-socket.io
```

**Database:**
```bash
npm install pg typeorm
```

**Authentication:**
```bash
npm install passport passport-jwt passport-local bcrypt
```

**Validation:**
```bash
npm install class-validator class-transformer
```

**Utilities:**
```bash
npm install joi uuid rxjs
```

**Dev Dependencies:**
```bash
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt @types/uuid
npm install -D @nestjs/cli @nestjs/schematics
```

### 1.2 Cấu trúc thư mục Backend

```
apps/api/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   ├── config/
│   │   └── configuration.ts         # Config loader
│   ├── common/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── decorators/
│   └── modules/                     # Sẽ thêm sau
├── test/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── package.json
```

### 1.3 Tạo file cấu hình

#### `apps/api/tsconfig.json`

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

#### `apps/api/tsconfig.build.json`

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

#### `apps/api/nest-cli.json`

```json
{
  "$schema": "https://nestjs.org/schema.json",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": ["**/*.json"]
  }
}
```

### 1.4 Cập nhật `apps/api/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sport Hub API')
    .setDescription('API Documentation for Sport Hub')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
```

### 1.5 Cập nhật `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sport_hub',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
  ],
})
export class AppModule {}
```

### 1.6 Tạo `apps/api/src/config/configuration.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sport_hub',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  swagger: {
    title: 'Sport Hub API',
    description: 'API Documentation for Sport Hub',
    version: '1.0',
  },
}));
```

### 1.7 Tạo Exception Filter

#### `apps/api/src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'object' && 'message' in message ? message.message : message,
      ...(typeof message === 'object' && 'error' in message && { error: message.error }),
    };

    response.status(status).json(errorResponse);
  }
}
```

### 1.8 Tạo `.env.example`

#### `apps/api/.env.example`

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/sport_hub

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=ap-southeast-1

# VNPay (Optional)
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=https://sandbox.vnpayment.vn

# MoMo (Optional)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_URL=https://test-payment.momo.vn
```

---

## Shared Package Setup

### 2.1 Cài Dependencies

```bash
cd packages/shared
npm install
```

### 2.2 Tạo cấu trúc thư mục

```
packages/shared/
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── court.types.ts
│   ├── constants/
│   │   ├── app.constants.ts
│   │   └── index.ts
│   └── utils/
│       └── date.utils.ts
├── dist/                    # Generated sau khi build
├── package.json
├── tsconfig.json
└── README.md
```

### 2.3 Cập nhật `packages/shared/package.json`

```json
{
  "name": "@sport-hub/shared",
  "version": "1.0.0",
  "description": "Shared types, constants, and utilities",
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

### 2.4 Tạo `packages/shared/tsconfig.json`

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

### 2.5 Tạo Type Files

#### `packages/shared/src/types/api.types.ts`

```typescript
// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

// Search Params
export interface SearchParams extends PaginationParams {
  query?: string;
  sportId?: number;
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

// Date Range
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

// Time Slot
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}
```

#### `packages/shared/src/types/user.types.ts`

```typescript
// User Status
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

// Auth Provider
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

// Gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// User Role
export enum UserRole {
  PLAYER = 'player',
  COURT_OWNER = 'court_owner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// User Entity
export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  bio?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  rankId: number;
  totalPoints: number;
  totalMatches: number;
  totalBookings: number;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Create User DTO
export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Auth Response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}
```

#### `packages/shared/src/types/court.types.ts`

```typescript
// Court Status
export enum CourtStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Sport
export interface Sport {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
  courtCount?: number;
}

// Amenity
export interface Amenity {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  category?: string;
}

// Court Image
export interface CourtImage {
  id: string;
  url: string;
  caption?: string;
  type: 'gallery' | 'thumbnail' | '360' | 'video';
  sortOrder?: number;
}

// Court Entity
export interface Court {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  basePrice: number;
  priceUnit: string;
  weekendPrice?: number;
  peakHourPrice?: number;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  coverImageUrl?: string;
  status: CourtStatus;
  isFeatured: boolean;
  isVerified: boolean;
  amenities?: Amenity[];
  sports?: Sport[];
  images?: CourtImage[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Court DTO
export interface CreateCourtDto {
  name: string;
  description?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  basePrice: number;
  priceUnit?: string;
  weekendPrice?: number;
  peakHourPrice?: number;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
  amenities?: number[];
  sports?: number[];
}

// Court Query DTO
export interface CourtQueryDto {
  query?: string;
  sportId?: number;
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string;
  sort?: 'price' | 'rating' | 'distance' | 'createdAt';
  order?: 'ASC' | 'DESC';
  lat?: number;
  lng?: number;
  radius?: number;
}
```

### 2.6 Tạo Constants

#### `packages/shared/src/constants/app.constants.ts`

```typescript
// Sports List
export const SPORTS = [
  { id: 1, name: 'Bóng đá 5', slug: 'football-5', icon: '⚽' },
  { id: 2, name: 'Bóng đá 7', slug: 'football-7', icon: '⚽' },
  { id: 3, name: 'Cầu lông', slug: 'badminton', icon: '🏸' },
  { id: 4, name: 'Tennis', slug: 'tennis', icon: '🎾' },
  { id: 5, name: 'Bóng rổ', slug: 'basketball', icon: '🏀' },
  { id: 6, name: 'Pickleball', slug: 'pickleball', icon: '🏓' },
  { id: 7, name: 'Bóng chuyền', slug: 'volleyball', icon: '🏐' },
] as const;

// Amenities List
export const AMENITIES = [
  { id: 1, name: 'Máy lạnh', slug: 'air_conditioner', icon: '❄️' },
  { id: 2, name: 'WiFi miễn phí', slug: 'wifi_free', icon: '📶' },
  { id: 3, name: 'Chỗ để xe', slug: 'parking', icon: '🅿️' },
  { id: 4, name: 'Phòng thay đồ', slug: 'changing_room', icon: '🚿' },
  { id: 5, name: 'Nước uống miễn phí', slug: 'water_free', icon: '💧' },
  { id: 6, name: 'Thuê vợt', slug: 'racket_rental', icon: '🏸' },
  { id: 7, name: 'Cafe', slug: 'cafe', icon: '☕' },
] as const;

// User Ranks
export const USER_RANKS = [
  { id: 1, name: 'Tân binh', slug: 'rookie', minMatches: 0, color: '#9CA3AF' },
  { id: 2, name: 'Nghiệp dư', slug: 'amateur', minMatches: 6, color: '#22C55E' },
  { id: 3, name: 'Chuyên nghiệp', slug: 'pro', minMatches: 21, color: '#3B82F6' },
  { id: 4, name: 'Cao thủ', slug: 'expert', minMatches: 51, color: '#F59E0B' },
  { id: 5, name: 'Huyền thoại', slug: 'legend', minMatches: 101, color: '#EF4444' },
] as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  REFUNDED: 'refunded',
} as const;

// Court Status
export const COURT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

// Match Status
export const MATCH_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  WALLET: 'wallet',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;
```

#### `packages/shared/src/constants/index.ts`

```typescript
export * from './app.constants';
```

### 2.7 Tạo Utils

#### `packages/shared/src/utils/date.utils.ts`

```typescript
import {
  format,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Format date
export function formatDate(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy',
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: vi });
}

// Format datetime
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

// Check if time slot is available
export function isTimeSlotAvailable(
  startTime: string,
  endTime: string,
  existingSlots: { startTime: string; endTime: string }[],
): boolean {
  const slotStart = parseInt(startTime.replace(':', ''), 10);
  const slotEnd = parseInt(endTime.replace(':', ''), 10);

  for (const slot of existingSlots) {
    const existStart = parseInt(slot.startTime.replace(':', ''), 10);
    const existEnd = parseInt(slot.endTime.replace(':', ''), 10);

    if (slotStart < existEnd && slotEnd > existStart) {
      return false;
    }
  }

  return true;
}

// Generate time slots
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  while (currentMinutes + durationMinutes <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += durationMinutes;
  }

  return slots;
}

// Check weekend pricing
export function isWeekendRate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isWeekend(d);
}

// Date range helpers
export {
  addDays,
  addHours,
  addMinutes,
  differenceInMinutes,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  parseISO,
};
```

### 2.8 Tạo index.ts chính

#### `packages/shared/src/index.ts`

```typescript
// Types
export * from './types/api.types';
export * from './types/user.types';
export * from './types/court.types';

// Constants
export * from './constants';

// Utils
export * from './utils/date.utils';
```

### 2.9 Build Shared Package

```bash
cd packages/shared
npm run build
```

---

## Docker Setup

### 3.1 Tạo `infrastructure/docker/docker-compose.yml`

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
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d sport_hub"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sport-hub-network

  redis:
    image: redis:7-alpine
    container_name: sport-hub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sport-hub-network

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: sport-hub-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@sporthub.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - postgres
    networks:
      - sport-hub-network
    profiles:
      - tools

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  pgadmin_data:
    driver: local

networks:
  sport-hub-network:
    driver: bridge
```

### 3.2 Tạo `infrastructure/docker/redis.conf`

```conf
# Basic Configuration
bind 0.0.0.0
port 6379
protected-mode no

# Persistence
appendonly yes
appendfilename "appendonly.aof"

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Logging
loglevel notice
logfile ""

# Security (disabled for development)
# requirepass your-redis-password
```

### 3.3 Khởi động Docker

```bash
cd infrastructure/docker
docker-compose up -d

# Kiểm tra containers
docker ps

# Xem logs
docker-compose logs -f
```

---

## Configuration Files

### 4.1 ESLint Config

#### `apps/api/.eslintrc.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### 4.2 Prettier Config

#### `apps/api/.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 4.3 Package.json Scripts

Thêm scripts vào `apps/api/package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## Testing

### 5.1 Chạy Backend

```bash
cd apps/api
npm run start:dev
```

### 5.2 Verify

Mở trình duyệt:

1. **API Root:** http://localhost:3000/api/v1
   - Response: `{"statusCode":404,"message":"Cannot GET /api/v1/"}`

2. **Swagger Docs:** http://localhost:3000/docs
   - Xem tất cả API endpoints

3. **Health Check:** http://localhost:3000/api/v1/health
   - Có thể thêm endpoint health check

### 5.3 Tạo Health Check Endpoint (Tùy chọn)

Tạo `apps/api/src/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## Review Checklist

### Phase 1 Complete Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Cài NestJS CLI | ⬜ | |
| 2 | Cài dependencies | ⬜ | |
| 3 | Cấu hình tsconfig.json | ⬜ | |
| 4 | Cập nhật main.ts | ⬜ | |
| 5 | Cập nhật app.module.ts | ⬜ | |
| 6 | Tạo configuration.ts | ⬜ | |
| 7 | Tạo HttpExceptionFilter | ⬜ | |
| 8 | Tạo .env.example | ⬜ | |
| 9 | Setup shared package | ⬜ | |
| 10 | Build shared package | ⬜ | |
| 11 | Cấu hình Docker | ⬜ | |
| 12 | Chạy Docker containers | ⬜ | |
| 13 | Cấu hình ESLint | ⬜ | |
| 14 | Cấu hình Prettier | ⬜ | |
| 15 | Test API chạy | ⬜ | |

### Questions for Review

Trước khi qua Phase 2, hãy xác nhận:

1. ✅ API chạy ở http://localhost:3000
2. ✅ Swagger docs hiển thị đúng
3. ✅ Docker containers đang chạy
4. ✅ Shared package build thành công
5. ✅ Không có lỗi TypeScript/ESLint

---

## Next Steps

Sau khi Phase 1 hoàn thành và được review:

➡️ **Phase 2: Database & TypeORM Setup**
- Tạo User Entity đầu tiên
- Setup TypeORM DataSource
- Viết migration đầu tiên
- Kết nối database

➡️ **Phase 3: Auth Module**
- Register/Login endpoints
- JWT tokens
- Auth guards

---

## Liên Hệ

Nếu gặp lỗi:
1. Kiểm tra console logs
2. Xem Swagger docs
3. Kiểm tra Docker logs: `docker-compose logs`

**Version:** 1.0
**Last Updated:** 2026-05-09
