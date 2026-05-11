import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, In, LessThan, MoreThan } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { Message } from './entities/message.entity';
import { Court } from '../../entities/court.entity';
import {
  ConversationType,
  MessageType,
  ParticipantRole,
} from './enums';
import {
  CreateConversationDto,
  UpdateConversationDto,
  AddParticipantDto,
  SendMessageDto,
  UpdateMessageDto,
  ConversationQueryDto,
  MessageQueryDto,
} from './dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
  ) {}

  // ============ CONVERSATIONS ============

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const type = dto.type || ConversationType.DIRECT;

    if (type === ConversationType.COURT_INQUIRY && !dto.courtId) {
      throw new BadRequestException('Court ID là bắt buộc cho loại COURT_INQUIRY');
    }

    if (dto.courtId) {
      const court = await this.courtRepository.findOne({ where: { id: dto.courtId } });
      if (!court) {
        throw new NotFoundException('Sân không tồn tại');
      }

      const existingConversation = await this.conversationRepository.findOne({
        where: {
          courtId: dto.courtId,
          type: ConversationType.COURT_INQUIRY,
          createdBy: userId,
        },
        relations: ['participants'],
      });

      if (existingConversation) {
        const isParticipant = existingConversation.participants.some(
          (p) => p.userId === userId,
        );
        if (isParticipant) {
          return this.findOneConversation(existingConversation.id, userId);
        }
      }
    }

    const conversation = this.conversationRepository.create({
      type,
      courtId: dto.courtId || null,
      title: dto.title || null,
      isGroup: dto.isGroup || false,
      createdBy: userId,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    await this.addParticipant(savedConversation.id, userId, ParticipantRole.OWNER);

    if (type === ConversationType.COURT_INQUIRY && dto.courtId) {
      const court = await this.courtRepository.findOne({ where: { id: dto.courtId } });
      if (court) {
        await this.addParticipant(savedConversation.id, court.ownerId, ParticipantRole.MEMBER);
      }
    }

    if (dto.participantIds && dto.participantIds.length > 0) {
      for (const participantId of dto.participantIds) {
        if (participantId !== userId) {
          await this.addParticipant(savedConversation.id, participantId, ParticipantRole.MEMBER);
        }
      }
    }

    return this.findOneConversation(savedConversation.id, userId);
  }

  async findAllConversations(
    userId: string,
    query: ConversationQueryDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { type, courtId, page = 1, limit = 20 } = query;

    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'lastSender')
      .leftJoinAndSelect('conversation.court', 'court')
      .where('participant.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('conversation.type = :type', { type });
    }

    if (courtId) {
      queryBuilder.andWhere('conversation.courtId = :courtId', { courtId });
    }

    queryBuilder.orderBy('participant.isPinned', 'DESC').addOrderBy('conversation.lastMessageAt', 'DESC');

    const total = await queryBuilder.getCount();
    const conversations = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.getUnreadCount(conv.id, userId);
        return this.mapConversationToResponse(conv, userId, unreadCount);
      }),
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOneConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'participants',
        'participants.user',
        'court',
        'lastMessage',
        'lastMessage.sender',
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Cuộc trò chuyện không tồn tại');
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('Bạn không có quyền truy cập cuộc trò chuyện này');
    }

    return conversation;
  }

  async updateConversation(
    id: string,
    userId: string,
    dto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.findOneConversation(id, userId);

    const participant = conversation.participants.find((p) => p.userId === userId);
    if (!participant || (participant.role !== ParticipantRole.OWNER && participant.role !== ParticipantRole.ADMIN)) {
      throw new ForbiddenException('Bạn không có quyền cập nhật cuộc trò chuyện này');
    }

    if (dto.title !== undefined) {
      conversation.title = dto.title;
    }
    if (dto.isGroup !== undefined) {
      conversation.isGroup = dto.isGroup;
    }

    await this.conversationRepository.save(conversation);
    return this.findOneConversation(id, userId);
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findOneConversation(id, userId);

    const participant = conversation.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== ParticipantRole.OWNER) {
      throw new ForbiddenException('Chỉ người tạo mới có thể xóa cuộc trò chuyện');
    }

    await this.conversationRepository.delete(id);
  }

  async leaveConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findOneConversation(id, userId);

    if (conversation.type === ConversationType.DIRECT) {
      throw new BadRequestException('Không thể rời khỏi cuộc trò chuyện trực tiếp');
    }

    const participant = conversation.participants.find((p) => p.userId === userId);
    if (!participant) {
      throw new NotFoundException('Bạn không có trong cuộc trò chuyện này');
    }

    if (participant.role === ParticipantRole.OWNER) {
      throw new BadRequestException('Người tạo không thể rời cuộc trò chuyện');
    }

    await this.participantRepository.delete(participant.id);
  }

  // ============ PARTICIPANTS ============

  async addParticipant(
    conversationId: string,
    userId: string,
    role: ParticipantRole = ParticipantRole.MEMBER,
    nickname?: string,
  ): Promise<ConversationParticipant> {
    const existing = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (existing) {
      return existing;
    }

    const participant = this.participantRepository.create({
      conversationId,
      userId,
      role,
      nickname: nickname || null,
    });

    return this.participantRepository.save(participant);
  }

  async removeParticipant(
    conversationId: string,
    targetUserId: string,
    userId: string,
  ): Promise<void> {
    await this.findOneConversation(conversationId, userId);

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId: targetUserId },
    });

    if (!participant) {
      throw new NotFoundException('Người dùng không có trong cuộc trò chuyện');
    }

    if (participant.role === ParticipantRole.OWNER) {
      throw new ForbiddenException('Không thể xóa người tạo cuộc trò chuyện');
    }

    await this.participantRepository.delete(participant.id);
  }

  async markAsRead(
    conversationId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    await this.findOneConversation(conversationId, userId);

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (participant) {
      participant.lastReadMessageId = messageId;
      participant.lastReadAt = new Date();
      await this.participantRepository.save(participant);
    }
  }

  async toggleMute(conversationId: string, userId: string): Promise<boolean> {
    await this.findOneConversation(conversationId, userId);

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (participant) {
      participant.isMuted = !participant.isMuted;
      await this.participantRepository.save(participant);
      return participant.isMuted;
    }

    return false;
  }

  async togglePin(conversationId: string, userId: string): Promise<boolean> {
    await this.findOneConversation(conversationId, userId);

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (participant) {
      participant.isPinned = !participant.isPinned;
      await this.participantRepository.save(participant);
      return participant.isPinned;
    }

    return false;
  }

  // ============ MESSAGES ============

  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    await this.findOneConversation(conversationId, senderId);

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content: dto.content,
      messageType: dto.messageType || MessageType.TEXT,
      metadata: dto.metadata || null,
      replyToId: dto.replyToId || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(conversationId, {
      lastMessageId: savedMessage.id,
      lastMessageAt: savedMessage.createdAt,
    });

    return this.findOneMessage(savedMessage.id);
  }

  async findMessages(
    conversationId: string,
    userId: string,
    query: MessageQueryDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    await this.findOneConversation(conversationId, userId);

    const { page = 1, limit = 50, beforeMessageId } = query;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replySender')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    if (beforeMessageId) {
      const beforeMessage = await this.messageRepository.findOne({
        where: { id: beforeMessageId },
      });
      if (beforeMessage) {
        queryBuilder.andWhere('message.createdAt < :beforeDate', {
          beforeDate: beforeMessage.createdAt,
        });
      }
    }

    queryBuilder.orderBy('message.createdAt', 'DESC').take(limit);

    const total = await queryBuilder.getCount();
    const messages = await queryBuilder.getMany();

    return {
      data: messages.reverse().map((m) => this.mapMessageToResponse(m)),
      total,
      page,
      limit,
    };
  }

  async findOneMessage(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    return message;
  }

  async updateMessage(
    messageId: string,
    userId: string,
    dto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể chỉnh sửa tin nhắn của mình');
    }

    message.content = dto.content;
    message.isEdited = true;
    await this.messageRepository.save(message);

    return this.findOneMessage(messageId);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    const conversation = await this.findOneConversation(message.conversationId, userId);
    const participant = conversation.participants.find((p) => p.userId === userId);

    if (message.senderId !== userId && (!participant || participant.role !== ParticipantRole.OWNER)) {
      throw new ForbiddenException('Bạn không có quyền xóa tin nhắn này');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await this.messageRepository.save(message);
  }

  // ============ OWNER METHODS ============

  async getCourtConversations(
    courtId: string,
    ownerId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: any[]; total: number }> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không phải là chủ sân này');
    }

    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'lastSender')
      .where('conversation.courtId = :courtId', { courtId })
      .orderBy('conversation.lastMessageAt', 'DESC');

    const total = await queryBuilder.getCount();
    const conversations = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.getUnreadCount(conv.id, ownerId);
        return this.mapConversationToResponse(conv, ownerId, unreadCount);
      }),
    );

    return { data, total };
  }

  // ============ STATS ============

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      return 0;
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    if (participant.lastReadAt) {
      queryBuilder.andWhere('message.createdAt > :lastReadAt', {
        lastReadAt: participant.lastReadAt,
      });
    } else {
      const firstParticipant = await this.participantRepository.findOne({
        where: { conversationId },
        order: { joinedAt: 'ASC' },
      });
      if (firstParticipant && firstParticipant.userId !== userId) {
        queryBuilder.andWhere('message.createdAt > :joinedAt', {
          joinedAt: firstParticipant.joinedAt,
        });
      }
    }

    return queryBuilder.getCount();
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const participants = await this.participantRepository.find({
      where: { userId },
    });

    let totalUnread = 0;
    for (const participant of participants) {
      if (participant.isMuted) continue;
      const unread = await this.getUnreadCount(participant.conversationId, userId);
      totalUnread += unread;
    }

    return totalUnread;
  }

  // ============ HELPERS ============

  private mapConversationToResponse(conversation: any, currentUserId: string, unreadCount: number): any {
    const currentParticipant = conversation.participants?.find(
      (p: any) => p.userId === currentUserId,
    );

    const otherParticipants = conversation.participants
      ?.filter((p: any) => p.userId !== currentUserId)
      ?.map((p: any) => ({
        id: p.user.id,
        fullName: p.user.fullName,
        avatarUrl: p.user.avatarUrl,
        role: p.role,
        nickname: p.nickname,
      })) || [];

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      isGroup: conversation.isGroup,
      court: conversation.court
        ? {
            id: conversation.court.id,
            name: conversation.court.name,
            coverImageUrl: conversation.court.coverImageUrl,
          }
        : null,
      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage.id,
            content: conversation.lastMessage.content,
            messageType: conversation.lastMessage.messageType,
            createdAt: conversation.lastMessage.createdAt,
            sender: conversation.lastMessage.sender
              ? {
                  id: conversation.lastMessage.sender.id,
                  fullName: conversation.lastMessage.sender.fullName,
                  avatarUrl: conversation.lastMessage.sender.avatarUrl,
                }
              : null,
          }
        : null,
      lastMessageAt: conversation.lastMessageAt,
      participants: conversation.participants?.map((p: any) => ({
        id: p.user.id,
        fullName: p.user.fullName,
        avatarUrl: p.user.avatarUrl,
        role: p.role,
        nickname: p.nickname,
      })) || [],
      otherParticipants,
      currentUserRole: currentParticipant?.role,
      currentUserIsPinned: currentParticipant?.isPinned || false,
      currentUserIsMuted: currentParticipant?.isMuted || false,
      unreadCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private mapMessageToResponse(message: any): any {
    return {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      messageType: message.messageType,
      metadata: message.metadata,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            content: message.replyTo.content,
            sender: message.replyTo.sender
              ? {
                  id: message.replyTo.sender.id,
                  fullName: message.replyTo.sender.fullName,
                  avatarUrl: message.replyTo.sender.avatarUrl,
                }
              : null,
          }
        : null,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender
        ? {
            id: message.sender.id,
            fullName: message.sender.fullName,
            avatarUrl: message.sender.avatarUrl,
          }
        : null,
    };
  }
}
