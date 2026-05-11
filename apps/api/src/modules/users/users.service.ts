import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, SelectQueryBuilder } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import {
  UpdateProfileDto,
  UserResponseDto,
  UserProfileDto,
  UserPublicProfileDto,
  UserQueryDto,
  UserListResponseDto,
  UserStatsDto,
} from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['rank'],
    });
  }

  async findAll(query: UserQueryDto): Promise<UserListResponseDto> {
    const { query: searchQuery, status, page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.rank', 'rank');

    if (searchQuery) {
      queryBuilder.where(
        '(LOWER(user.fullName) LIKE :query OR LOWER(user.email) LIKE :query OR user.phone LIKE :query)',
        { query: `%${searchQuery}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const validSortFields = ['createdAt', 'fullName', 'totalPoints', 'totalMatches', 'followerCount'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

    queryBuilder
      .orderBy(`user.${sortField}`, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((user) => this.toUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.findById(userId);
    return this.toUserProfile(user);
  }

  async getPublicProfile(userId: string): Promise<UserPublicProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rank'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return this.toUserPublicProfile(user);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.findById(userId);

    const winRate = user.totalMatches > 0
      ? Math.round((user.totalPoints / (user.totalMatches * 100)) * 100)
      : undefined;

    return {
      totalPoints: user.totalPoints,
      totalMatches: user.totalMatches,
      totalBookings: user.totalBookings,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
      winRate,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileDto> {
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

    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone || null;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.bio !== undefined) updateData.bio = dto.bio;

    if (Object.keys(updateData).length > 0) {
      await this.userRepository.update(userId, updateData);
      this.logger.log(`User ${userId} updated their profile`);
    }

    const updatedUser = await this.findById(userId);
    return this.toUserProfile(updatedUser);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfileDto> {
    if (!avatarUrl || !avatarUrl.trim()) {
      throw new BadRequestException('URL avatar không hợp lệ');
    }

    await this.userRepository.update(userId, { avatarUrl: avatarUrl.trim() });
    this.logger.log(`User ${userId} updated their avatar`);

    const updatedUser = await this.findById(userId);
    return this.toUserProfile(updatedUser);
  }

  async deactivateUser(userId: string, adminId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);

    if (userId === adminId) {
      throw new BadRequestException('Không thể tự vô hiệu hóa tài khoản của mình');
    }

    await this.userRepository.update(userId, { status: UserStatus.INACTIVE });
    this.logger.log(`User ${userId} deactivated by admin ${adminId}`);

    return { message: 'Tài khoản đã được vô hiệu hóa' };
  }

  async activateUser(userId: string, adminId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);

    await this.userRepository.update(userId, { status: UserStatus.ACTIVE });
    this.logger.log(`User ${userId} activated by admin ${adminId}`);

    return { message: 'Tài khoản đã được kích hoạt' };
  }

  async banUser(userId: string, adminId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);

    if (userId === adminId) {
      throw new BadRequestException('Không thể tự cấm tài khoản của mình');
    }

    await this.userRepository.update(userId, { status: UserStatus.BANNED });
    this.logger.log(`User ${userId} banned by admin ${adminId}`);

    return { message: 'Tài khoản đã bị cấm' };
  }

  async unbanUser(userId: string, adminId: string): Promise<{ message: string }> {
    const user = await this.findById(userId);

    await this.userRepository.update(userId, { status: UserStatus.ACTIVE });
    this.logger.log(`User ${userId} unbanned by admin ${adminId}`);

    return { message: 'Tài khoản đã được mở cấm' };
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: ['id'],
    });
    return { exists: !!user };
  }

  async checkPhoneExists(phone: string): Promise<{ exists: boolean }> {
    const user = await this.userRepository.findOne({
      where: { phone },
      select: ['id'],
    });
    return { exists: !!user };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
      gender: user.gender,
      bio: user.bio,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      rank: user.rank,
      totalPoints: user.totalPoints,
      totalMatches: user.totalMatches,
      totalBookings: user.totalBookings,
      authProvider: user.authProvider,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toUserProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
      gender: user.gender,
      bio: user.bio,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      rank: user.rank ? {
        id: user.rank.id,
        name: user.rank.name,
        slug: user.rank.slug,
        iconUrl: user.rank.iconUrl,
        color: user.rank.color,
      } : null,
      totalPoints: user.totalPoints,
      totalMatches: user.totalMatches,
      totalBookings: user.totalBookings,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postCount: user.postCount,
      createdAt: user.createdAt,
    };
  }

  private toUserPublicProfile(user: User): UserPublicProfileDto {
    return {
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      bio: user.bio,
      rank: user.rank ? {
        id: user.rank.id,
        name: user.rank.name,
        slug: user.rank.slug,
        iconUrl: user.rank.iconUrl,
        color: user.rank.color,
      } : null,
      totalMatches: user.totalMatches,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      createdAt: user.createdAt,
    };
  }
}
