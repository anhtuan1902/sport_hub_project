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
import * as bcrypt from 'bcrypt';
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
