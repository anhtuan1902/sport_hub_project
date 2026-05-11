import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Court } from '../../../entities/court.entity';
import { ConversationType, ParticipantRole } from '../enums';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Index('idx_conversations_type', ['type'])
@Index('idx_conversations_court', ['courtId'])
@Index('idx_conversations_created_by', ['createdBy'])
@Index('idx_conversations_last_message_at', ['lastMessageAt'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ type: 'uuid', name: 'court_id', nullable: true })
  courtId: string | null;

  @ManyToOne(() => Court, { nullable: true })
  @JoinColumn({ name: 'court_id' })
  court: Court | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'boolean', name: 'is_group', default: false })
  isGroup: boolean;

  @Column({ type: 'uuid', name: 'last_message_id', nullable: true })
  lastMessageId: string | null;

  @OneToMany(() => Message, (message) => message.conversation, { nullable: true })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message | null;

  @Column({ type: 'timestamptz', name: 'last_message_at', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ConversationParticipant, (participant) => participant.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
