import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Court } from './court.entity';
import { Sport } from './sport.entity';

export enum MatchStatus {
  OPEN = 'open',
  FULL = 'full',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('matches')
@Index('idx_matches_sport', ['sportId'])
@Index('idx_matches_date', ['matchDate'])
@Index('idx_matches_status', ['status'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'uuid', nullable: true, name: 'court_id' })
  courtId: string;

  @ManyToOne(() => Court, { nullable: true })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ type: 'int', name: 'sport_id' })
  sportId: number;

  @ManyToOne(() => Sport)
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'max_players' })
  maxPlayers: number;

  @Column({ type: 'int', name: 'min_players', default: 1 })
  minPlayers: number;

  @Column({ type: 'int', name: 'current_players', default: 1 })
  currentPlayers: number;

  @Column({ type: 'varchar', length: 20, name: 'skill_level', default: 'all' })
  skillLevel: string;

  @Column({ type: 'varchar', length: 20, name: 'gender_restrict', default: 'all' })
  genderRestrict: string;

  @Column({ type: 'int', nullable: true, name: 'age_min' })
  ageMin: number;

  @Column({ type: 'int', nullable: true, name: 'age_max' })
  ageMax: number;

  @Column({ type: 'date', name: 'match_date' })
  matchDate: Date;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', nullable: true, name: 'end_time' })
  endTime: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'duration_hours', default: 1.5 })
  durationHours: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'location_name' })
  locationName: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true, name: 'location_address' })
  locationAddress: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true, name: 'cost_per_person' })
  costPerPerson: number;

  @Column({ type: 'text', array: true, nullable: true, name: 'cost_includes' })
  costIncludes: string[];

  @Column({ type: 'boolean', name: 'is_free', default: false })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'total_collected', default: 0 })
  totalCollected: number;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.OPEN })
  status: MatchStatus;

  @Column({ type: 'boolean', name: 'has_chat', default: true })
  hasChat: boolean;

  @Column({ type: 'boolean', name: 'allow_join_request', default: true })
  allowJoinRequest: boolean;

  @Column({ type: 'boolean', name: 'auto_accept', default: false })
  autoAccept: boolean;

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ type: 'int', name: 'join_count', default: 0 })
  joinCount: number;

  @Column({ type: 'int', name: 'expire_after_hours', default: 72 })
  expireAfterHours: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @OneToMany(() => MatchPlayer, (player) => player.match)
  players: MatchPlayer[];

  @OneToMany(() => MatchMessage, (message) => message.match)
  messages: MatchMessage[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('match_players')
export class MatchPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.players)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, default: 'accepted' })
  role: string;

  @Column({ type: 'varchar', length: 20, name: 'payment_status', default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true, name: 'amount_paid' })
  amountPaid: number;

  @Column({ type: 'boolean', name: 'checked_in', default: false })
  checkedIn: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'checked_in_at' })
  checkedInAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

@Entity('match_messages')
export class MatchMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.messages)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'varchar', length: 20, name: 'message_type', default: 'text' })
  messageType: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
