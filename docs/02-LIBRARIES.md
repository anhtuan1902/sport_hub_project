# Tài Liệu Các Thư Viện Sử Dụng

## Mục Lục

1. [Backend (NestJS)](#backend-nestjs)
2. [Database](#database)
3. [Authentication](#authentication)
4. [Validation & Documentation](#validation--documentation)
5. [Real-time Communication](#real-time-communication)
6. [Utilities](#utilities)
7. [Shared Package](#shared-package)
8. [Dev Dependencies](#dev-dependencies)

---

## Backend (NestJS)

### @nestjs/core & @nestjs/common

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.3.0 |
| **Mục Đích** | Framework chính của backend |
| **Công Dụng** | Xây dựng ứng dụng server-side với kiến trúc module hóa |

**Giải thích:**
NestJS là một framework Node.js giống như Angular nhưng cho backend. Nó cung cấp:
- **Dependency Injection** - Quản lý dependencies tự động
- **Modules** - Tổ chức code theo modules
- **Decorators** - @Controller, @Injectable, @Module...
- **Pipes/Guards/Interceptors** - Xử lý request/response

```typescript
// Ví dụ sử dụng
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return 'List of users';
  }
}
```

---

### @nestjs/platform-express

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.3.0 |
| **Mục Đích** | Integration layer với Express.js |
| **Công Dụng** | NestJS sử dụng Express làm HTTP server adapter |

**Giải thích:**
NestJS không tự xử lý HTTP requests mà dựa trên Express (hoặc Fastify). Package này kết nối NestJS với Express.

---

### @nestjs/config

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^3.2.0 |
| **Mục Đích** | Quản lý configuration từ file .env |
| **Công Dụng** | Load và validate environment variables |

**Giải thích:**
Thay vì đọc `process.env` trực tiếp, ta dùng ConfigService để quản lý tập trung.

```typescript
// Sử dụng
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getDatabaseUrl() {
    return this.config.get('DATABASE_URL');
  }
}
```

---

### @nestjs/swagger

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^7.3.0 |
| **Mục Đích** | Tạo API documentation tự động |
| **Công Dụng** | Generate Swagger UI & OpenAPI spec |

**Giải thích:**
Tự động tạo documentation cho API dựa trên decorators và DTOs. Rất hữu ích cho việc testing và giao tiếp API.

```typescript
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Get all users' })
  @Get()
  findAll() {}
}
```

**Truy cập:** http://localhost:3000/docs

---

## Database

### @nestjs/typeorm

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.0.2 |
| **Mục Đích** | ORM integration cho NestJS |
| **Công Dụng** | Quản lý database, entities, migrations |

**Giải thích:**
TypeORM giúp tương tác với database bằng TypeScript/JavaScript thay vì viết SQL trực tiếp.

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;
}
```

---

### typeorm

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^0.3.20 |
| **Mục Đích** | ORM cho Node.js |
| **Công Dụng** | Database agnostic - hỗ trợ PostgreSQL, MySQL, SQLite... |

**Các tính năng chính:**
- **Entities** - Định nghĩa bảng dưới dạng class
- **Repositories** - Truy vấn database
- **Migrations** - Quản lý schema changes
- **Relations** - Quan hệ giữa các bảng (1-1, 1-N, N-N)

---

### pg

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^8.11.3 |
| **Mục Đích** | PostgreSQL driver cho Node.js |
| **Công Dụng** | Kết nối và truy vấn PostgreSQL |

**Giải thích:**
`pg` là driver native giúp Node.js giao tiếp với PostgreSQL. TypeORM sử dụng nó "bên dưới".

```typescript
// Không cần dùng trực tiếp, TypeORM quản lý
import { Client } from 'pg';
const client = new Client();
await client.connect();
```

---

## Authentication

### @nestjs/jwt

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.2.0 |
| **Mục Đích** | JWT (JSON Web Token) module |
| **Công Dụng** | Tạo và verify JWT tokens |

**Giải thích:**
JWT là cách phổ biến để xác thực người dùng. Token chứa thông tin user và được signed để không thể giả mạo.

```typescript
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  generateToken(userId: string) {
    return this.jwt.sign({ sub: userId });
  }
}
```

---

### @nestjs/passport

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.0.3 |
| **Mục Đích** | Passport.js integration cho NestJS |
| **Công Dụng** | Authentication strategies (JWT, Local, OAuth) |

**Giải thích:**
Passport là thư viện xử lý authentication rất phổ biến. Nó hỗ trợ nhiều "strategies":
- **Local** - Username/password
- **JWT** - Token-based
- **Google/Facebook** - OAuth

---

### passport

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^0.7.0 |
| **Mục Đích** | Core authentication library |
| **Công Dụng** | Xử lý authentication logic |

**Giải thích:**
Passport core library. Cung cấp framework để implement các authentication strategies khác nhau.

---

### passport-jwt

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^4.0.1 |
| **Mục Đích** | JWT strategy cho Passport |
| **Công Dụng** | Xác thực request bằng JWT token |

```typescript
import { Strategy as JwtStrategy } from 'passport-jwt';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your-secret-key',
};

passport.use(new JwtStrategy(options, (payload, done) => {
  // payload chứa thông tin từ JWT
  return done(null, payload);
}));
```

---

### passport-local

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^1.0.0 |
| **Mục Đích** | Local username/password strategy |
| **Công Dụng** | Đăng nhập bằng email/password |

**Giải thích:**
Strategy cho đăng nhập truyền thống với username/password (lưu trong database).

---

### bcrypt

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^5.1.1 |
| **Mục Đích** | Mã hóa password |
| **Công Dụng** | Hash password trước khi lưu vào database |

**Giải thích:**
Không bao giờ lưu password plain text. bcrypt mã hóa password với salt để bảo mật.

```typescript
import * as bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

---

## Validation & Documentation

### class-validator

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^0.14.1 |
| **Mục Đích** | Decorator-based validation |
| **Công Dụng** | Validate DTOs, request data |

**Giải thích:**
Dùng decorators để định nghĩa validation rules cho DTOs.

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

**Các decorators phổ biến:**
| Decorator | Mục Đích |
|-----------|----------|
| `@IsEmail()` | Validate email |
| `@IsString()` | Phải là string |
| `@MinLength(n)` | Độ dài tối thiểu |
| `@MaxLength(n)` | Độ dài tối đa |
| `@IsOptional()` | Có thể bỏ qua |
| `@IsEnum()` | Phải là enum value |
| `@IsUUID()` | Phải là UUID format |
| `@IsDateString()` | Phải là ISO date string |

---

### class-transformer

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^0.5.1 |
| **Mục Đích** | Transform objects |
| **Công Dụng** | Convert plain objects ↔ class instances |

**Giải thích:**
Làm việc với class-validator để:
- Chuyển plain object → class instance (để validate)
- Ẩn sensitive fields (@Exclude)
- Thêm metadata cho responses

```typescript
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  passwordHash: string;
}
```

---

### swagger-ui-express

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | Tự động cài với @nestjs/swagger |
| **Mục Đích** | Swagger UI interface |
| **Công Dụng** | Giao diện web để test API |

**Truy cập:** http://localhost:3000/docs

---

## Real-time Communication

### @nestjs/websockets

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.3.0 |
| **Mục Đích** | WebSocket gateway cho NestJS |
| **Công Dụng** | Real-time communication (chat, notifications) |

**Giải thích:**
WebSocket cho phép server gửi data đến client mà không cần client request trước. Khác với HTTP (request-response).

```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  sendMessage(message: string) {
    this.server.emit('newMessage', message);
  }
}
```

---

### @nestjs/platform-socket.io

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^10.3.0 |
| **Mục Đích** | Socket.io adapter cho NestJS |
| **Công Dụng** | WebSocket server implementation |

**Giải thích:**
Socket.io là thư viện cung cấp real-time, bidirectional communication. Hỗ trợ:
- Fallback cho browsers không hỗ trợ WebSocket
- Automatic reconnection
- Rooms/Namespaces

---

### socket.io

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^4.7.4 |
| **Mục Đích** | Core Socket.io library |
| **Công Dụng** | Real-time engine |

---

## Utilities

### joi

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^17.12.0 |
| **Mục Đích** | Schema validation |
| **Công Dụng** | Validate configuration, environment variables |

**Giải thích:**
Khác với class-validator (dùng decorators), Joi dùng schema objects. Thường dùng để validate config trước khi app start.

```typescript
import * as Joi from 'joi';

const configSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
});

const { error, value } = configSchema.validate(process.env);
if (error) throw new Error(`Config validation: ${error.message}`);
```

---

### uuid

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^9.0.1 |
| **Mục Đích** | Generate UUIDs |
| **Công Dụng** | Tạo unique identifiers cho entities |

**Giải thích:**
UUID (Universally Unique Identifier) là chuỗi 36 ký tự unique. Dùng thay thế auto-increment ID để:
- Không expose internal IDs
- Merge data từ nhiều sources
- Distributed systems

```typescript
import { v4 as uuidv4 } from 'uuid';

const id = uuidv4();
// Output: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
```

---

### rxjs

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^7.8.1 |
| **Mục Đích** | Reactive Extensions for JavaScript |
| **Công Dụng** | Xử lý asynchronous events, streams |

**Giải thích:**
RxJS cung cấp Observables - một cách mạnh mẽ để handle async operations. NestJS sử dụng RxJS internally cho:
- HTTP requests (return Observables)
- WebSocket events
- Background tasks

```typescript
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UsersService {
  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map(users => users.map(u => this.toDto(u)))
    );
  }
}
```

---

## Shared Package

### date-fns

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^3.3.0 |
| **Mục Đích** | Date manipulation |
| **Công Dụng** | Format, parse, calculate dates |

**Giải thích:**
Thay thế Moment.js (đã deprecated). Nhẹ hơn và tree-shakeable.

```typescript
import { format, addHours, isAfter, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Format date
format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi });
// Output: "09/05/2026 19:30"

// Add hours
const endTime = addHours(startTime, 2);

// Compare dates
isAfter(date1, date2);

// Parse ISO string
parseISO('2026-05-09T12:00:00Z');
```

**Các functions phổ biến:**
| Function | Mục Đích |
|----------|----------|
| `format()` | Format date theo pattern |
| `parseISO()` | Parse ISO string → Date |
| `addDays/Hours/Minutes()` | Thêm thời gian |
| `differenceInMinutes()` | Tính chênh lệch |
| `isAfter/isBefore()` | So sánh ngày |
| `startOfDay/endOfDay()` | Lấy thời điểm đầu/cuối ngày |

---

### zod

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^3.22.4 |
| **Mục Đích** | TypeScript-first schema validation |
| **Công Dụng** | Validate data với type inference |

**Giải thích:**
Giống Joi nhưng có TypeScript support tốt hơn. Tự động infer types.

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

// TypeScript type được infer tự động
type User = z.infer<typeof UserSchema>;

const result = UserSchema.safeParse(data);
if (result.success) {
  // result.data có type User
}
```

---

## Dev Dependencies

### @types/passport-jwt

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Mục Đích** | TypeScript types cho passport-jwt |
| **Công Dụng** | IntelliSense, type checking |

**Giải thích:**
`@types/*` packages chứa TypeScript type definitions cho các thư viện JavaScript thuần.

---

### @types/passport-local

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Mục Đích** | TypeScript types cho passport-local |
| **Công Dụng** | Type safety khi dùng passport-local |

---

### @types/bcrypt

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Mục Đích** | TypeScript types cho bcrypt |
| **Công Dụng** | Type safety khi dùng bcrypt |

---

### @types/uuid

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Mục Đích** | TypeScript types cho uuid |
| **Công Dụng** | Type safety khi dùng uuid |

---

### @types/express

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Mục Đích** | TypeScript types cho Express |
| **Công Dụng** | Type Request, Response, NextFunction |

---

### typescript

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Version** | ^5.4.0 |
| **Mục Đích** | TypeScript compiler |
| **Công Dụng** | Type checking, compile TS → JS |

---

## Tổng Kết Dependencies

### Dependencies Chính (Production)

| Package | Mục Đích | Bắt Buộc? |
|---------|----------|-----------|
| @nestjs/core, common | NestJS framework | ✅ |
| @nestjs/config | Config management | ✅ |
| @nestjs/typeorm | Database ORM | ✅ |
| @nestjs/jwt | JWT tokens | ✅ |
| @nestjs/passport | Authentication | ✅ |
| @nestjs/swagger | API docs | ✅ |
| typeorm, pg | Database | ✅ |
| passport, passport-jwt | Auth strategies | ✅ |
| bcrypt | Password hashing | ✅ |
| class-validator, transformer | Validation | ✅ |
| @nestjs/websockets | Real-time | 🔶 |
| @nestjs/platform-socket.io | Socket.io | 🔶 |
| socket.io | Real-time engine | 🔶 |
| joi, uuid, rxjs | Utilities | 🔶 |

### Dev Dependencies

| Package | Mục Đích |
|---------|----------|
| @types/* | Type definitions |
| typescript | TypeScript compiler |
| @nestjs/cli | NestJS CLI |
| @nestjs/schematics | NestJS code generators |

### Optional (Tùy Nhu Cầu)

| Package | Mục Đích |
|---------|----------|
| @nestjs/schedule | Cron jobs |
| @nestjs/bull | Queue/background jobs |
| @nestjs/cache-manager | Caching |
| class-sanitizer | XSS sanitization |

---

## Ghi Chú

- **🔶** = Có thể thêm sau, không bắt buộc lúc đầu
- **✅** = Nên cài ngay từ đầu
- **@types/*** = Chỉ cần nếu dùng TypeScript

---

## Tham Khảo

- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- Passport.js: http://www.passportjs.org
- Socket.io: https://socket.io
- class-validator: https://github.com/typestack/class-validator
- date-fns: https://date-fns.org
- Zod: https://zod.dev
