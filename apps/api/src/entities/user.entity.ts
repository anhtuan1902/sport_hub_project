import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, name: 'full_name' })
  fullName: string;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'boolean', name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ type: 'int', name: 'rank_id', nullable: true })
  rankId: number | null;

  @ManyToOne(() => UserRank, { nullable: true })
  @JoinColumn({ name: 'rank_id' })
  rank: UserRank | null;

  @Column({ type: 'int', name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', name: 'total_matches', default: 0 })
  totalMatches: number;

  @Column({ type: 'int', name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ type: 'enum', enum: AuthProvider, name: 'auth_provider', default: AuthProvider.EMAIL })
  authProvider: AuthProvider;

  @Column({ type: 'varchar', length: 255, name: 'provider_id', nullable: true })
  providerId: string | null;

  @Column({ type: 'int', name: 'follower_count', default: 0 })
  followerCount: number;

  @Column({ type: 'int', name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ type: 'int', name: 'post_count', default: 0 })
  postCount: number;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'timestamptz', name: 'created_at', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', default: () => 'NOW()' })
  updatedAt: Date;
}

@Entity('user_ranks')
export class UserRank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'int', name: 'min_matches' })
  minMatches: number;

  @Column({ type: 'int', name: 'max_matches', nullable: true })
  maxMatches: number | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  benefits: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
