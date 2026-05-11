import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { ParticipantRole } from '../enums';

@Entity('conversation_participants')
@Index('idx_participants_user', ['userId'])
@Index('idx_participants_conversation', ['conversationId'])
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  @Column({ type: 'uuid', name: 'last_read_message_id', nullable: true })
  lastReadMessageId: string | null;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_read_message_id' })
  lastReadMessage: Message | null;

  @Column({ type: 'timestamptz', name: 'last_read_at', nullable: true })
  lastReadAt: Date | null;

  @Column({ type: 'boolean', name: 'is_muted', default: false })
  isMuted: boolean;

  @Column({ type: 'boolean', name: 'is_pinned', default: false })
  isPinned: boolean;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
