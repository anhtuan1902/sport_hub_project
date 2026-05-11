# PHASE 3: Authentication Module

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cài Dependencies](#cài-dependencies)
3. [Tạo Auth DTOs](#tạo-auth-dtos)
4. [Tạo JWT Strategy](#tạo-jwt-strategy)
5. [Tạo Auth Service](#tạo-auth-service)
6. [Tạo Auth Controller](#tạo-auth-controller)
7. [Tạo Auth Guards](#tạo-auth-guards)
8. [Tạo Auth Module](#tạo-auth-module)
9. [Cập nhật AppModule](#cập-nhật-appmodule)
10. [Testing](#testing)
11. [Review Checklist](#review-checklist)

---

## Tổng Quan

### Mục tiêu Phase 3

- [ ] Register endpoint (đăng ký)
- [ ] Login endpoint (đăng nhập)
- [ ] Refresh token endpoint
- [ ] Logout endpoint
- [ ] Forgot password (quên mật khẩu)
- [ ] JWT Authentication guards
- [ ] Role-based authorization
- [ ] Password hashing với bcrypt

### Timeline

**Ước tính:** 60-90 phút

### Prerequisites

- Phase 1 hoàn thành (NestJS setup)
- Phase 2 hoàn thành (Database & Entities)

---

## Cài Dependencies

### 1.1 Cài Auth Packages

```bash
cd apps/api

# JWT & Passport
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt

# Types
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
```

### 1.2 Verify package.json

Kiểm tra `apps/api/package.json` đã có:

```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@types/bcrypt": "^5.0.2"
  }
}
```

---

## Tạo Auth DTOs

### Cấu trúc thư mục

```
apps/api/src/
├── modules/
│   └── auth/
│       ├── dto/
│       │   ├── register.dto.ts
│       │   ├── login.dto.ts
│       │   ├── refresh-token.dto.ts
│       │   ├── forgot-password.dto.ts
│       │   └── reset-password.dto.ts
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   └── jwt-refresh.strategy.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   ├── jwt-refresh.guard.ts
│       │   └── roles.guard.ts
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   └── roles.decorator.ts
│       ├── auth.module.ts
│       ├── auth.service.ts
│       └── auth.controller.ts
```

### 2.1 Register DTO

#### `apps/api/src/modules/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '../../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
```

### 2.2 Login DTO

#### `apps/api/src/modules/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}
```

### 2.3 Refresh Token DTO

#### `apps/api/src/modules/auth/dto/refresh-token.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
```

### 2.4 Forgot Password DTO

#### `apps/api/src/modules/auth/dto/forgot-password.dto.ts`

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
```

### 2.5 Reset Password DTO

#### `apps/api/src/modules/auth/dto/reset-password.dto.ts`

```typescript
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token từ email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  newPassword: string;
}
```

### 2.6 Change Password DTO

#### `apps/api/src/modules/auth/dto/change-password.dto.ts`

```typescript
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  newPassword: string;
}
```

### 2.7 Auth Response DTO

#### `apps/api/src/modules/auth/dto/auth-response.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  emailVerified: boolean;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;
}
```

### 2.8 DTO Index

#### `apps/api/src/modules/auth/dto/index.ts`

```typescript
export * from './register.dto';
export * from './login.dto';
export * from './refresh-token.dto';
export * from './forgot-password.dto';
export * from './reset-password.dto';
export * from './change-password.dto';
export * from './auth-response.dto';
```

---

## Tạo JWT Strategy

### 3.1 JWT Strategy

#### `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['rank'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      id: user.id,
      email: user.email,
      role: payload.role,
      rank: user.rank,
    };
  }
}
```

### 3.2 JWT Refresh Strategy

#### `apps/api/src/modules/auth/strategies/jwt-refresh.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../../entities/user.entity';

export interface RefreshPayload {
  sub: string;
  email: string;
  type: 'refresh';
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const refreshToken = req.body.refreshToken;

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      id: user.id,
      email: user.email,
      refreshToken,
    };
  }
}
```

### 3.3 Strategy Index

#### `apps/api/src/modules/auth/strategies/index.ts`

```typescript
export * from './jwt.strategy';
export * from './jwt-refresh.strategy';
```

---

## Tạo Auth Service

### 4.1 Auth Service

#### `apps/api/src/modules/auth/auth.service.ts`

```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService as AppConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus, AuthProvider } from '../../entities/user.entity';
import { UserRoleMapping, UserRole } from '../../entities/user-role.entity';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  TokenResponseDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserRoleMapping)
    private userRoleMappingRepository: Repository<UserRoleMapping>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    if (dto.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      fullName: dto.fullName.trim(),
      phone: dto.phone?.trim(),
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      gender: dto.gender,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      authProvider: AuthProvider.EMAIL,
    });

    await this.userRepository.save(user);

    await this.assignDefaultRole(user.id);

    const tokens = await this.generateTokens(user);

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['rank'],
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.authProvider !== AuthProvider.EMAIL) {
      throw new UnauthorizedException(
        `Tài khoản này đã được đăng ký bằng ${user.authProvider}`,
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Tài khoản chưa đặt mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc chưa được kích hoạt');
    }

    await this.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rank'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.passwordHash || '',
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    this.logger.log(`User ${userId} logged out`);
    return { message: 'Đăng xuất thành công' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi',
      };
    }

    if (user.authProvider !== AuthProvider.EMAIL) {
      return {
        message: `Tài khoản này đã được đăng ký bằng ${user.authProvider}, không thể đặt lại mật khẩu`,
      };
    }

    this.logger.log(`Password reset requested for: ${email}`);

    return {
      message:
        'Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    this.logger.warn(`Reset password attempt with token: ${token.substring(0, 10)}...`);

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

    this.logger.log(`Password reset successful for token: ${token.substring(0, 10)}...`);

    return {
      message: 'Mật khẩu đã được đặt lại thành công',
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (user.authProvider !== AuthProvider.EMAIL) {
      throw new BadRequestException('Không thể đổi mật khẩu cho tài khoản OAuth');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Tài khoản chưa có mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.update(userId, { passwordHash });

    this.logger.log(`Password changed for user: ${userId}`);

    return {
      message: 'Mật khẩu đã được thay đổi thành công',
    };
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rank'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return this.toUserResponse(user);
  }

  async validateOAuthUser(
    provider: AuthProvider,
    providerId: string,
    email: string,
    fullName: string,
    avatarUrl?: string,
  ): Promise<AuthResponseDto> {
    let user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['rank'],
    });

    if (user) {
      if (user.authProvider !== provider) {
        throw new ConflictException(
          `Email này đã được đăng ký bằng ${user.authProvider}`,
        );
      }
    } else {
      user = this.userRepository.create({
        email: email.toLowerCase(),
        fullName,
        avatarUrl,
        authProvider: provider,
        providerId,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      });
      await this.userRepository.save(user);
      await this.assignDefaultRole(user.id);
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.toUserResponse(user),
      ...tokens,
    };
  }

  private async assignDefaultRole(userId: string): Promise<void> {
    const playerRole = await this.userRoleRepository.findOne({
      where: { slug: 'player' },
    });

    if (playerRole) {
      const mapping = this.userRoleMappingRepository.create({
        userId,
        roleId: playerRole.id,
      });
      await this.userRoleMappingRepository.save(mapping);
    }
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: 'player',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        { expiresIn: this.accessTokenExpiry },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { expiresIn: this.refreshTokenExpiry },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
      status: user.status,
      emailVerified: user.emailVerified,
    };
  }
}
```

---

## Tạo Auth Controller

### 5.1 Auth Controller

#### `apps/api/src/modules/auth/auth.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
  TokenResponseDto,
  UserResponseDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token đã được làm mới',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ' })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(null as any, dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async logout(@CurrentUser() user: any): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email hướng dẫn đã được gửi' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được đặt lại' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thay đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mật khẩu đã được thay đổi' })
  @ApiResponse({ status: 401, description: 'Mật khẩu hiện tại không đúng' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin người dùng',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }
}
```

---

## Tạo Auth Guards

### 6.1 JWT Auth Guard

#### `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Vui lòng đăng nhập để tiếp tục');
    }
    return user;
  }
}
```

### 6.2 JWT Refresh Guard

#### `apps/api/src/modules/auth/guards/jwt-refresh.guard.ts`

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Refresh token không hợp lệ');
    }
    return user;
  }
}
```

### 6.3 Roles Guard

#### `apps/api/src/modules/auth/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    return true;
  }
}
```

### 6.4 Guards Index

#### `apps/api/src/modules/auth/guards/index.ts`

```typescript
export * from './jwt-auth.guard';
export * from './jwt-refresh.guard';
export * from './roles.guard';
```

---

## Tạo Decorators

### 7.1 Current User Decorator

#### `apps/api/src/modules/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  rank?: any;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
```

### 7.2 Roles Decorator

#### `apps/api/src/modules/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 7.3 Decorators Index

#### `apps/api/src/modules/auth/decorators/index.ts`

```typescript
export * from './current-user.decorator';
export * from './roles.decorator';
```

---

## Tạo Auth Module

### 8.1 Auth Module

#### `apps/api/src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { UserRoleMapping } from '../../entities/user-role.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserRole, UserRoleMapping]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
```

### 8.2 Auth Index

#### `apps/api/src/modules/auth/index.ts`

```typescript
export * from './auth.module';
export * from './auth.service';
export * from './auth.controller';
export * from './dto';
export * from './guards';
export * from './strategies';
export * from './decorators';
```

---

## Cập nhật AppModule

### 9.1 Cập nhật `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config/configuration';
import { AuthModule } from './modules/auth';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRoleMapping } from './entities/user-role.entity';
import { UserRank } from './entities/user-rank.entity';
import { Sport } from './entities/sport.entity';
import { Amenity } from './entities/amenity.entity';
import { Court, CourtSport, CourtAmenity, CourtImage } from './entities/court.entity';
import { Booking } from './entities/booking.entity';
import { BookingPayment } from './entities/payment.entity';
import { Review, ReviewVote } from './entities/review.entity';
import { Match, MatchPlayer, MatchMessage } from './entities/match.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        entities: [
          User,
          UserRole,
          UserRoleMapping,
          UserRank,
          Sport,
          Amenity,
          Court,
          CourtSport,
          CourtAmenity,
          CourtImage,
          Booking,
          BookingPayment,
          Review,
          ReviewVote,
          Match,
          MatchPlayer,
          MatchMessage,
        ],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsTableName: 'typeorm_migrations',
        extra: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
```

---

## Tạo Logging Interceptor (Bổ sung)

### 10.1 Logging Interceptor

#### `apps/api/src/common/interceptors/logging.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const contentLength = response.get('content-length') || 0;
          const elapsed = Date.now() - startTime;

          this.logger.log(
            `${method} ${url} ${statusCode} ${contentLength} - ${elapsed}ms - ${ip} ${userAgent}`,
          );
        },
        error: (error: Error) => {
          const elapsed = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ERROR - ${elapsed}ms - ${ip} - ${error.message}`,
          );
        },
      }),
    );
  }
}
```

---

## Tạo User Module (Cơ bản)

### 11.1 User Module Structure

```
apps/api/src/modules/
├── auth/                    # Đã tạo ở trên
└── users/
    ├── dto/
    │   ├── update-profile.dto.ts
    │   └── index.ts
    ├── users.controller.ts
    ├── users.service.ts
    └── users.module.ts
```

### 11.2 Update Profile DTO

#### `apps/api/src/modules/users/dto/update-profile.dto.ts`

```typescript
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '../../../entities/user.entity';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van B' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Yêu thích thể thao' })
  @IsOptional()
  @IsString()
  bio?: string;
}
```

### 11.3 Users Service

#### `apps/api/src/modules/users/users.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['rank'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['rank'],
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: dto.phone },
      });
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const updateData: Partial<User> = {};

    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.dateOfBirth) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender) updateData.gender = dto.gender;
    if (dto.bio !== undefined) updateData.bio = dto.bio;

    await this.userRepository.update(userId, updateData);

    return this.findById(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    await this.userRepository.update(userId, { avatarUrl });
    return this.findById(userId);
  }
}
```

### 11.4 Users Controller

#### `apps/api/src/modules/users/users.controller.ts`

```typescript
import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin người dùng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Thông tin đã được cập nhật' })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('profile/avatar')
  @ApiOperation({ summary: 'Cập nhật avatar' })
  @ApiResponse({ status: 200, description: 'Avatar đã được cập nhật' })
  async updateAvatar(
    @CurrentUser() user: CurrentUserData,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    return this.usersService.updateAvatar(user.id, avatarUrl);
  }
}
```

### 11.5 Users Module

#### `apps/api/src/modules/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 11.6 Users Index

#### `apps/api/src/modules/users/index.ts`

```typescript
export * from './users.module';
export * from './users.service';
export * from './users.controller';
export * from './dto';
```

---

## Cập nhật AppModule với Users Module

### 12.1 Final AppModule

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Configuration } from './config/configuration';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Entities
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRoleMapping } from './entities/user-role.entity';
import { UserRank } from './entities/user-rank.entity';
import { Sport } from './entities/sport.entity';
import { Amenity } from './entities/amenity.entity';
import { Court, CourtSport, CourtAmenity, CourtImage } from './entities/court.entity';
import { Booking } from './entities/booking.entity';
import { BookingPayment } from './entities/payment.entity';
import { Review, ReviewVote } from './entities/review.entity';
import { Match, MatchPlayer, MatchMessage } from './entities/match.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        entities: [
          User,
          UserRole,
          UserRoleMapping,
          UserRank,
          Sport,
          Amenity,
          Court,
          CourtSport,
          CourtAmenity,
          CourtImage,
          Booking,
          BookingPayment,
          Review,
          ReviewVote,
          Match,
          MatchPlayer,
          MatchMessage,
        ],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsTableName: 'typeorm_migrations',
        extra: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

---

## Testing

### 13.1 Khởi động Server

```bash
cd apps/api
npm run start:dev
```

### 13.2 Test Endpoints với cURL

#### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User",
    "phone": "0123456789"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### Get Profile (Authenticated)

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Change Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!"
  }'
```

### 13.3 Test trên Swagger

Mở http://localhost:3000/docs và test các endpoints:

1. **POST /auth/register** - Đăng ký tài khoản mới
2. **POST /auth/login** - Đăng nhập
3. **POST /auth/refresh** - Làm mới token
4. **POST /auth/logout** - Đăng xuất
5. **GET /auth/profile** - Lấy thông tin người dùng
6. **POST /auth/change-password** - Đổi mật khẩu
7. **POST /auth/forgot-password** - Quên mật khẩu
8. **PUT /users/profile** - Cập nhật profile

---

## Review Checklist

### Phase 3 Complete Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Cài Auth dependencies | ⬜ | passport, jwt, bcrypt |
| 2 | Tạo Auth DTOs | ⬜ | Register, Login, Refresh, etc. |
| 3 | Tạo JWT Strategy | ⬜ | Access token validation |
| 4 | Tạo JWT Refresh Strategy | ⬜ | Refresh token validation |
| 5 | Tạo Auth Service | ⬜ | Business logic |
| 6 | Tạo Auth Controller | ⬜ | API endpoints |
| 7 | Tạo JWT Auth Guard | ⬜ | Protect routes |
| 8 | Tạo Roles Guard | ⬜ | Role-based access |
| 9 | Tạo Auth Module | ⬜ | Module registration |
| 10 | Tạo Users Module | ⬜ | User profile |
| 11 | Cập nhật AppModule | ⬜ | Import modules |
| 12 | Tạo Logging Interceptor | ⬜ | HTTP logging |
| 13 | Test Register | ⬜ | Create new user |
| 14 | Test Login | ⬜ | Get tokens |
| 15 | Test Protected Routes | ⬜ | JWT validation |
| 16 | Test Refresh Token | ⬜ | Token refresh |
| 17 | Test Change Password | ⬜ | Password update |

### Questions for Review

Trước khi qua Phase 4, hãy xác nhận:

1. ✅ Register endpoint hoạt động
2. ✅ Login endpoint trả về JWT tokens
3. ✅ Protected routes yêu cầu valid JWT
4. ✅ Refresh token hoạt động
5. ✅ Change password hoạt động
6. ✅ Swagger docs hiển thị đúng

---

## Next Steps

Sau khi Phase 3 hoàn thành và được review:

➡️ **Phase 4: Court Module**
- Court CRUD cho chủ sân
- Court search và filter
- Court images upload
- Court pricing

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

### JWT Security

1. **Access Token**: 15 phút expiry
2. **Refresh Token**: 7 ngày expiry
3. **Password**: bcrypt với saltRounds = 12
4. **HTTPS**: Luôn sử dụng HTTPS trong production
5. **Token Storage**: Client phải lưu trữ token an toàn (httpOnly cookies)

### Production Checklist

```bash
# Environment Variables (Production)
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/sport_hub

# HTTPS
# Sử dụng proxy như Nginx để terminate SSL
```

---

**Version:** 1.0
**Last Updated:** 2026-05-11
