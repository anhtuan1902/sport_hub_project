import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, MoreThan, LessThan, IsNull, Between } from 'typeorm';
import { Match, MatchStatus } from '../../entities/match.entity';
import { MatchPlayer } from '../../entities/match.entity';
import { MatchMessage } from '../../entities/match.entity';
import { Court } from '../../entities/court.entity';
import { Sport } from '../../entities/sport.entity';
import { User } from '../../entities/user.entity';
import {
  CreateMatchDto,
  UpdateMatchDto,
  MatchQueryDto,
  MatchResponseDto,
  MatchListResponseDto,
  MatchSummaryDto,
  PlayerResponseDto,
  JoinMatchDto,
  RespondJoinRequestDto,
  SendMessageDto,
} from './dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchPlayer)
    private matchPlayerRepository: Repository<MatchPlayer>,
    @InjectRepository(MatchMessage)
    private matchMessageRepository: Repository<MatchMessage>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateMatchDto): Promise<MatchResponseDto> {
    const sport = await this.sportRepository.findOne({ where: { id: dto.sportId } });
    if (!sport) {
      throw new NotFoundException('Môn thể thao không tồn tại');
    }

    if (dto.courtId) {
      const court = await this.courtRepository.findOne({ where: { id: dto.courtId } });
      if (!court) {
        throw new NotFoundException('Sân không tồn tại');
      }
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (dto.expireAfterHours || 72));

    const match = this.matchRepository.create({
      creatorId: userId,
      courtId: dto.courtId,
      sportId: dto.sportId,
      title: dto.title || `${sport.name} - ${new Date(dto.matchDate).toLocaleDateString('vi-VN')}`,
      description: dto.description,
      maxPlayers: dto.maxPlayers,
      minPlayers: dto.minPlayers || 1,
      currentPlayers: 1,
      skillLevel: dto.skillLevel || 'all',
      genderRestrict: dto.genderRestrict || 'all',
      ageMin: dto.ageMin,
      ageMax: dto.ageMax,
      matchDate: new Date(dto.matchDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationHours: dto.durationHours || 1.5,
      locationName: dto.locationName,
      latitude: dto.latitude,
      longitude: dto.longitude,
      locationAddress: dto.locationAddress,
      costPerPerson: dto.costPerPerson || 0,
      costIncludes: dto.costIncludes,
      isFree: dto.isFree || false,
      hasChat: dto.hasChat ?? true,
      allowJoinRequest: dto.allowJoinRequest ?? true,
      autoAccept: dto.autoAccept ?? false,
      expireAfterHours: dto.expireAfterHours || 72,
      expiresAt,
      status: MatchStatus.OPEN,
    });

    const savedMatch = await this.matchRepository.save(match);

    const creatorPlayer = this.matchPlayerRepository.create({
      matchId: savedMatch.id,
      userId,
      role: 'creator',
      paymentStatus: 'paid',
    });
    await this.matchPlayerRepository.save(creatorPlayer);

    return this.findOne(savedMatch.id, userId);
  }

  async findAll(query: MatchQueryDto, userId?: string): Promise<MatchListResponseDto> {
    const {
      sportId,
      courtId,
      dateFrom,
      dateTo,
      status,
      skillLevel,
      genderRestrict,
      hasSlots,
      sort = 'upcoming',
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.creator', 'creator')
      .leftJoinAndSelect('match.court', 'court')
      .leftJoinAndSelect('match.sport', 'sport')
      .leftJoinAndSelect('match.players', 'players');

    if (sportId) {
      queryBuilder.andWhere('match.sportId = :sportId', { sportId });
    }

    if (courtId) {
      queryBuilder.andWhere('match.courtId = :courtId', { courtId });
    }

    if (dateFrom) {
      queryBuilder.andWhere('match.matchDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('match.matchDate <= :dateTo', { dateTo });
    }

    if (status) {
      queryBuilder.andWhere('match.status = :status', { status });
    } else {
      queryBuilder.andWhere('match.status IN (:...statuses)', {
        statuses: [MatchStatus.OPEN, MatchStatus.FULL, MatchStatus.IN_PROGRESS],
      });
    }

    if (skillLevel && skillLevel !== 'all') {
      queryBuilder.andWhere('match.skillLevel IN (:...levels)', {
        levels: ['all', skillLevel],
      });
    }

    if (genderRestrict && genderRestrict !== 'all') {
      queryBuilder.andWhere('match.genderRestrict IN (:...genders)', {
        genders: ['all', genderRestrict],
      });
    }

    if (hasSlots === true) {
      queryBuilder.andWhere('match.currentPlayers < match.maxPlayers');
    }

    const now = new Date();
    queryBuilder.andWhere('match.expiresAt > :now', { now });

    switch (sort) {
      case 'oldest':
        queryBuilder.orderBy('match.matchDate', 'ASC').addOrderBy('match.startTime', 'ASC');
        break;
      case 'popular':
        queryBuilder.orderBy('match.joinCount', 'DESC').addOrderBy('match.viewCount', 'DESC');
        break;
      case 'nearest':
        queryBuilder.orderBy('match.matchDate', 'ASC').addOrderBy('match.startTime', 'ASC');
        break;
      default:
        queryBuilder.orderBy('match.matchDate', 'ASC').addOrderBy('match.startTime', 'ASC');
    }

    const total = await queryBuilder.getCount();
    const matches = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: matches.map((m) => this.mapToResponse(m, userId)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string, userId?: string): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['creator', 'court', 'sport', 'players', 'players.user'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    await this.matchRepository.increment({ id }, 'viewCount', 1);

    return this.mapToResponse(match, userId);
  }

  async findMyMatches(userId: string, page = 1, limit = 20): Promise<MatchListResponseDto> {
    const playerMatches = await this.matchPlayerRepository.find({
      where: { userId },
      select: ['matchId'],
    });

    const matchIds = playerMatches.map((p) => p.matchId);

    if (matchIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
    }

    const [matches, total] = await this.matchRepository.findAndCount({
      where: { id: In(matchIds) },
      relations: ['creator', 'court', 'sport', 'players', 'players.user'],
      order: { matchDate: 'ASC', startTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: matches.map((m) => this.mapToResponse(m, userId)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async getMyCreatedMatches(userId: string, page = 1, limit = 20): Promise<MatchListResponseDto> {
    const [matches, total] = await this.matchRepository.findAndCount({
      where: { creatorId: userId },
      relations: ['creator', 'court', 'sport', 'players', 'players.user'],
      order: { matchDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: matches.map((m) => this.mapToResponse(m, userId)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async getSummary(userId: string): Promise<MatchSummaryDto> {
    const now = new Date();

    const [totalMatches, openMatches, myMatches, upcomingMatches] = await Promise.all([
      this.matchRepository.count({
        where: {
          status: In([MatchStatus.OPEN, MatchStatus.FULL, MatchStatus.IN_PROGRESS]),
          expiresAt: MoreThan(now),
        },
      }),
      this.matchRepository.count({
        where: { status: MatchStatus.OPEN, expiresAt: MoreThan(now) },
      }),
      this.matchPlayerRepository.count({ where: { userId } }),
      this.matchRepository.count({
        where: {
          status: In([MatchStatus.OPEN, MatchStatus.FULL]),
          matchDate: MoreThan(now),
          expiresAt: MoreThan(now),
        },
      }),
    ]);

    return {
      totalMatches,
      openMatches,
      myMatches,
      upcomingMatches,
    };
  }

  async update(id: string, userId: string, dto: UpdateMatchDto): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({ where: { id } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật trận đấu này');
    }

    if (match.status !== MatchStatus.OPEN) {
      throw new BadRequestException('Không thể cập nhật trận đấu đã bắt đầu hoặc kết thúc');
    }

    const updateData: Partial<Match> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.maxPlayers !== undefined) updateData.maxPlayers = dto.maxPlayers;
    if (dto.skillLevel !== undefined) updateData.skillLevel = dto.skillLevel;
    if (dto.genderRestrict !== undefined) updateData.genderRestrict = dto.genderRestrict;
    if (dto.ageMin !== undefined) updateData.ageMin = dto.ageMin;
    if (dto.ageMax !== undefined) updateData.ageMax = dto.ageMax;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.costPerPerson !== undefined) updateData.costPerPerson = dto.costPerPerson;
    if (dto.isFree !== undefined) updateData.isFree = dto.isFree;
    if (dto.autoAccept !== undefined) updateData.autoAccept = dto.autoAccept;

    await this.matchRepository.update(id, updateData);

    return this.findOne(id, userId);
  }

  async join(id: string, userId: string, dto: JoinMatchDto): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['players'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId === userId) {
      throw new BadRequestException('Bạn là người tạo trận đấu này');
    }

    if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.CANCELLED) {
      throw new BadRequestException('Trận đấu đã kết thúc hoặc bị hủy');
    }

    if (match.expiresAt < new Date()) {
      throw new BadRequestException('Trận đấu đã hết hạn');
    }

    const existingPlayer = match.players.find((p) => p.userId === userId);
    if (existingPlayer) {
      throw new ConflictException('Bạn đã tham gia trận đấu này');
    }

    if (match.currentPlayers >= match.maxPlayers) {
      throw new BadRequestException('Trận đấu đã đầy');
    }

    const player = this.matchPlayerRepository.create({
      matchId: id,
      userId,
      role: match.autoAccept ? 'accepted' : 'pending',
      paymentStatus: match.isFree ? 'paid' : 'pending',
      note: dto.note,
    });

    await this.matchPlayerRepository.save(player);

    await this.matchRepository.increment({ id }, 'currentPlayers', 1);
    await this.matchRepository.increment({ id }, 'joinCount', 1);

    if (match.autoAccept) {
      await this.matchRepository.update(id, { status: MatchStatus.FULL });
    }

    return this.findOne(id, userId);
  }

  async leave(id: string, userId: string): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['players'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId === userId) {
      throw new BadRequestException('Người tạo không thể rời khỏi trận đấu. Hãy hủy trận đấu.');
    }

    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      throw new NotFoundException('Bạn chưa tham gia trận đấu này');
    }

    await this.matchPlayerRepository.remove(player);

    await this.matchRepository.decrement({ id }, 'currentPlayers', 1);

    if (match.status === MatchStatus.FULL) {
      await this.matchRepository.update(id, { status: MatchStatus.OPEN });
    }

    return this.findOne(id, userId);
  }

  async respondToJoin(
    matchId: string,
    playerId: string,
    userId: string,
    dto: RespondJoinRequestDto,
  ): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['players'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể phê duyệt');
    }

    const player = match.players.find((p) => p.id === playerId);
    if (!player) {
      throw new NotFoundException('Yêu cầu tham gia không tồn tại');
    }

    if (player.role !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý');
    }

    player.role = dto.status;
    await this.matchPlayerRepository.save(player);

    if (dto.status === 'rejected') {
      await this.matchRepository.decrement({ id: matchId }, 'currentPlayers', 1);
    } else if (match.currentPlayers >= match.maxPlayers) {
      await this.matchRepository.update(matchId, { status: MatchStatus.FULL });
    }

    return this.findOne(matchId, userId);
  }

  async cancel(id: string, userId: string, reason?: string): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['players'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể hủy trận đấu');
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy trận đấu đã hoàn thành');
    }

    await this.matchRepository.update(id, { status: MatchStatus.CANCELLED });

    return this.findOne(id, userId);
  }

  async startMatch(id: string, userId: string): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({ where: { id } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể bắt đầu trận đấu');
    }

    if (match.status !== MatchStatus.OPEN && match.status !== MatchStatus.FULL) {
      throw new BadRequestException('Trận đấu không thể bắt đầu');
    }

    if (match.currentPlayers < match.minPlayers) {
      throw new BadRequestException(`Cần ít nhất ${match.minPlayers} người để bắt đầu`);
    }

    await this.matchRepository.update(id, { status: MatchStatus.IN_PROGRESS });

    return this.findOne(id, userId);
  }

  async completeMatch(id: string, userId: string): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({ where: { id } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể kết thúc trận đấu');
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Trận đấu chưa bắt đầu');
    }

    await this.matchRepository.update(id, { status: MatchStatus.COMPLETED });

    return this.findOne(id, userId);
  }

  async checkInPlayer(
    matchId: string,
    playerId: string,
    userId: string,
  ): Promise<MatchResponseDto> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (match.creatorId !== userId) {
      throw new ForbiddenException('Chỉ người tạo mới có thể check-in');
    }

    const player = await this.matchPlayerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      throw new NotFoundException('Người chơi không tồn tại');
    }

    player.checkedIn = true;
    player.checkedInAt = new Date();
    await this.matchPlayerRepository.save(player);

    return this.findOne(matchId, userId);
  }

  async getPlayers(matchId: string, userId?: string): Promise<PlayerResponseDto[]> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    const players = await this.matchPlayerRepository.find({
      where: { matchId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return players.map((p) => this.mapPlayerToResponse(p));
  }

  async getMessages(
    matchId: string,
    userId?: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: any[]; total: number }> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (!match.hasChat) {
      throw new BadRequestException('Trận đấu không có chat');
    }

    const [messages, total] = await this.matchMessageRepository.findAndCount({
      where: { matchId, isDeleted: false },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: messages.reverse().map((m) => ({
        id: m.id,
        matchId: m.matchId,
        senderId: m.senderId,
        messageType: m.messageType,
        content: m.content,
        createdAt: m.createdAt,
        sender: m.sender
          ? {
              id: m.sender.id,
              fullName: m.sender.fullName,
              avatarUrl: m.sender.avatarUrl,
            }
          : null,
      })),
      total,
    };
  }

  async sendMessage(
    matchId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<any> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['players'],
    });

    if (!match) {
      throw new NotFoundException('Trận đấu không tồn tại');
    }

    if (!match.hasChat) {
      throw new BadRequestException('Trận đấu không có chat');
    }

    const isParticipant = match.players.some((p) => p.userId === senderId);
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không phải là thành viên của trận đấu');
    }

    const message = this.matchMessageRepository.create({
      matchId,
      senderId,
      content: dto.content,
      messageType: dto.messageType || 'text',
    });

    const saved = await this.matchMessageRepository.save(message);

    const sender = await this.userRepository.findOne({ where: { id: senderId } });

    return {
      id: saved.id,
      matchId: saved.matchId,
      senderId: saved.senderId,
      messageType: saved.messageType,
      content: saved.content,
      createdAt: saved.createdAt,
      sender: sender
        ? {
            id: sender.id,
            fullName: sender.fullName,
            avatarUrl: sender.avatarUrl,
          }
        : null,
    };
  }

  async deleteMessage(messageId: string, userId: string): Promise<{ message: string }> {
    const message = await this.matchMessageRepository.findOne({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa tin nhắn của mình');
    }

    message.isDeleted = true;
    await this.matchMessageRepository.save(message);

    return { message: 'Xóa tin nhắn thành công' };
  }

  private mapToResponse(match: Match, currentUserId?: string): MatchResponseDto {
    const players: PlayerResponseDto[] = (match.players || []).map((p: MatchPlayer) => this.mapPlayerToResponse(p));

    return {
      id: match.id,
      creatorId: match.creatorId,
      courtId: match.courtId,
      sportId: match.sportId,
      title: match.title,
      description: match.description,
      maxPlayers: match.maxPlayers,
      minPlayers: match.minPlayers,
      currentPlayers: match.currentPlayers,
      skillLevel: match.skillLevel,
      genderRestrict: match.genderRestrict,
      ageMin: match.ageMin,
      ageMax: match.ageMax,
      matchDate: match.matchDate,
      startTime: match.startTime,
      endTime: match.endTime,
      durationHours: match.durationHours,
      locationName: match.locationName,
      latitude: match.latitude,
      longitude: match.longitude,
      locationAddress: match.locationAddress,
      costPerPerson: match.costPerPerson,
      costIncludes: match.costIncludes || [],
      isFree: match.isFree,
      totalCollected: match.totalCollected || 0,
      status: match.status,
      hasChat: match.hasChat,
      allowJoinRequest: match.allowJoinRequest,
      autoAccept: match.autoAccept,
      viewCount: match.viewCount || 0,
      joinCount: match.joinCount || 0,
      expiresAt: match.expiresAt,
      creator: match.creator
        ? {
            id: match.creator.id,
            fullName: match.creator.fullName,
            avatarUrl: match.creator.avatarUrl,
            phone: match.creator.phone,
          }
        : undefined,
      court: match.court
        ? {
            id: match.court.id,
            name: match.court.name,
            address: match.court.address,
            coverImageUrl: match.court.coverImageUrl,
          }
        : undefined,
      sport: match.sport
        ? {
            id: match.sport.id,
            name: match.sport.name,
            iconUrl: match.sport.iconUrl,
          }
        : undefined,
      players,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
  }

  private mapPlayerToResponse(player: MatchPlayer): PlayerResponseDto {
    return {
      id: player.id,
      matchId: player.matchId,
      userId: player.userId,
      role: player.role,
      paymentStatus: player.paymentStatus,
      amountPaid: player.amountPaid,
      checkedIn: player.checkedIn,
      checkedInAt: player.checkedInAt,
      note: player.note,
      user: player.user
        ? {
            id: player.user.id,
            fullName: player.user.fullName,
            avatarUrl: player.user.avatarUrl,
            phone: player.user.phone,
          }
        : undefined,
    };
  }
}
