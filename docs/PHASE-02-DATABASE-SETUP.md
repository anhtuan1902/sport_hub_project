# PHASE 2: Database & TypeORM Setup

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cài Dependencies](#cài-dependencies)
3. [Tạo Database Entities](#tạo-database-entities)
4. [Cấu Hình TypeORM DataSource](#cấu-hình-typeorm-datasource)
5. [Tạo Migrations](#tạo-migrations)
6. [Tạo Base Classes](#tạo-base-classes)
7. [Testing](#testing)
8. [Review Checklist](#review-checklist)

---

## Tổng Quan

### Mục tiêu Phase 2

- [ ] Tạo TypeORM Entities đầu tiên
- [ ] Cấu hình DataSource
- [ ] Chạy migrations
- [ ] Kết nối database thành công
- [ ] Tạo base repository/service

### Timeline

**Ước tính:** 45-90 phút

### Prerequisites

- Docker containers đang chạy (Phase 1)
- Database `sport_hub` đã được tạo

---

## Cài Dependencies

### Cài thêm packages cần thiết

```bash
cd apps/api

# TypeORM CLI cho migrations
npm install -D typeorm ts-node

# UUID generation
npm install uuid
npm install -D @types/uuid
```

---

## Tạo Database Entities

### Cấu trúc thư mục Entities

```
apps/api/src/
├── entities/                    # Database entities
│   ├── base/
│   │   └── base.entity.ts       # Base entity với common fields
│   ├── user.entity.ts
│   ├── user-role.entity.ts
│   ├── user-rank.entity.ts
│   ├── sport.entity.ts
│   ├── amenity.entity.ts
│   ├── court.entity.ts
│   ├── booking.entity.ts
│   └── ...
├── database/
│   ├── data-source.ts           # TypeORM DataSource config
│   └── migrations/              # Database migrations
│       └── 1705000000000-InitialSchema.ts
└── modules/                     # Feature modules (Phase 3+)
```

### 2.1 Base Entity

#### `apps/api/src/entities/base/base.entity.ts`

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

export abstract class BaseEntityNoId {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
```

### 2.2 User Entity

#### `apps/api/src/entities/user.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base/base.entity';
import { UserRole } from './user-role.entity';
import { UserRank } from './user-rank.entity';
import { Booking } from './booking.entity';
import { Court } from './court.entity';
import { Review } from './review.entity';
import { Match } from './match.entity';
import { Post } from './post.entity';

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
@Index('idx_users_email', ['email'])
@Index('idx_users_phone', ['phone'])
@Index('idx_users_status', ['status'])
export class User extends BaseEntity {
  // Authentication
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  @Exclude()
  passwordHash: string | null;

  @Column({ unique: true, nullable: true })
  phone: string | null;

  // Profile
  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  // Status
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  // Rank & Gamification
  @Column({ name: 'rank_id', nullable: true })
  rankId: number | null;

  @ManyToOne(() => UserRank, { nullable: true })
  @JoinColumn({ name: 'rank_id' })
  rank: UserRank | null;

  @Column({ name: 'total_points', default: 0 })
  totalPoints: number;

  @Column({ name: 'total_matches', default: 0 })
  totalMatches: number;

  @Column({ name: 'total_bookings', default: 0 })
  totalBookings: number;

  // OAuth
  @Column({
    name: 'auth_provider',
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.EMAIL,
  })
  authProvider: AuthProvider;

  @Column({ name: 'provider_id', nullable: true })
  providerId: string | null;

  // Social Stats
  @Column({ name: 'follower_count', default: 0 })
  followerCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'post_count', default: 0 })
  postCount: number;

  // Metadata
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  // Relations
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Court, (court) => court.owner)
  courts: Court[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Match, (match) => match.creator)
  matches: Match[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
```

### 2.3 User Role Entity

#### `apps/api/src/entities/user-role.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

@Entity('user_role_mappings')
export class UserRoleMapping {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: UserRole;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt: Date;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string | null;
}
```

### 2.4 User Rank Entity

#### `apps/api/src/entities/user-rank.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_ranks')
export class UserRank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({ name: 'min_matches' })
  minMatches: number;

  @Column({ name: 'max_matches', nullable: true })
  maxMatches: number | null;

  @Column({ length: 7, nullable: true })
  color: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  benefits: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.rank)
  users: User[];
}
```

### 2.5 Sport Entity

#### `apps/api/src/entities/sport.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CourtSport } from './court.entity';
import { Match } from './match.entity';

@Entity('sports')
export class Sport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'court_count', default: 0 })
  courtCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => CourtSport, (courtSport) => courtSport.sport)
  courtSports: CourtSport[];

  @OneToMany(() => Match, (match) => match.sport)
  matches: Match[];
}
```

### 2.6 Amenity Entity

#### `apps/api/src/entities/amenity.entity.ts`

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CourtAmenity } from './court.entity';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({ nullable: true })
  category: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => CourtAmenity, (courtAmenity) => courtAmenity.amenity)
  courtAmenities: CourtAmenity[];
}
```

### 2.7 Court Entity (Phức tạp nhất)

#### `apps/api/src/entities/court.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { User } from './user.entity';
import { Sport } from './sport.entity';
import { Amenity } from './amenity.entity';
import { CourtImage } from './court-image.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Match } from './match.entity';

export enum CourtStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('courts')
@Index('idx_courts_owner', ['ownerId'])
@Index('idx_courts_status', ['status'])
@Index('idx_courts_location', ['province', 'district'])
export class Court extends BaseEntity {
  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.courts)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  address: string;

  @Column({ nullable: true })
  province: string | null;

  @Column({ nullable: true })
  district: string | null;

  @Column({ nullable: true })
  ward: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ name: 'website', nullable: true })
  website: string | null;

  @Column({ name: 'facebook_url', nullable: true })
  facebookUrl: string | null;

  // Pricing
  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 0 })
  basePrice: number;

  @Column({ name: 'price_unit', default: 'hour' })
  priceUnit: string;

  @Column({ name: 'weekend_price', type: 'decimal', precision: 12, scale: 0, nullable: true })
  weekendPrice: number | null;

  @Column({ name: 'peak_hour_price', type: 'decimal', precision: 12, scale: 0, nullable: true })
  peakHourPrice: number | null;

  // Operating Hours
  @Column({ name: 'open_time', default: '06:00' })
  openTime: string;

  @Column({ name: 'close_time', default: '22:00' })
  closeTime: string;

  @Column({ name: 'slot_duration', default: 60 })
  slotDuration: number;

  // Stats (Denormalized)
  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ name: 'total_reviews', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 0, default: 0 })
  totalRevenue: number;

  // Media
  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string | null;

  // Status
  @Column({
    type: 'enum',
    enum: CourtStatus,
    default: CourtStatus.PENDING,
  })
  status: CourtStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  // Relations
  @OneToMany(() => CourtSport, (courtSport) => courtSport.court)
  courtSports: CourtSport[];

  @OneToMany(() => CourtAmenity, (courtAmenity) => courtAmenity.court)
  courtAmenities: CourtAmenity[];

  @OneToMany(() => CourtImage, (image) => image.court)
  images: CourtImage[];

  @OneToMany(() => Booking, (booking) => booking.court)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.court)
  reviews: Review[];

  @OneToMany(() => Match, (match) => match.court)
  matches: Match[];

  // Many-to-Many với Sports (computed field)
  @ManyToMany(() => Sport, (sport) => sport.courtSports)
  @JoinTable({
    name: 'court_sports',
    joinColumn: { name: 'court_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'sport_id', referencedColumnName: 'id' },
  })
  sports: Sport[];

  // Many-to-Many với Amenities (computed field)
  @ManyToMany(() => Amenity, (amenity) => amenity.courtAmenities)
  @JoinTable({
    name: 'court_amenities',
    joinColumn: { name: 'court_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'id' },
  })
  amenities: Amenity[];
}

// Junction Tables as separate entities for more control
@Entity('court_sports')
export class CourtSport {
  @Column({ name: 'court_id' })
  courtId: string;

  @Column({ name: 'sport_id' })
  sportId: number;

  @ManyToOne(() => Court, (court) => court.courtSports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @ManyToOne(() => Sport, (sport) => sport.courtSports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true })
  price: number | null;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;
}

@Entity('court_amenities')
export class CourtAmenity {
  @Column({ name: 'court_id' })
  courtId: string;

  @Column({ name: 'amenity_id' })
  amenityId: number;

  @ManyToOne(() => Court, (court) => court.courtAmenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @ManyToOne(() => Amenity, (amenity) => amenity.courtAmenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;
}

@Entity('court_images')
export class CourtImage extends BaseEntity {
  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => Court, (court) => court.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column()
  url: string;

  @Column({ nullable: true })
  caption: string | null;

  @Column({ default: 'gallery' })
  type: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;
}
```

### 2.8 Booking Entity

#### `apps/api/src/entities/booking.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { User } from './user.entity';
import { Court } from './court.entity';
import { Sport } from './sport.entity';
import { BookingPayment } from './payment.entity';
import { Review } from './review.entity';

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REFUNDED = 'refunded',
}

@Entity('bookings')
@Index('idx_bookings_user', ['userId'])
@Index('idx_bookings_court', ['courtId'])
@Index('idx_bookings_owner', ['ownerId'])
@Index('idx_bookings_date', ['bookingDate'])
@Index('idx_bookings_status', ['status'])
@Index('idx_bookings_code', ['bookingCode'])
export class Booking extends BaseEntity {
  @Column({ name: 'booking_code', unique: true })
  bookingCode: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => Court, (court) => court.bookings)
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ name: 'sport_id', nullable: true })
  sportId: number | null;

  @ManyToOne(() => Sport)
  @JoinColumn({ name: 'sport_id' })
  sport: Sport | null;

  @Column({ name: 'owner_id' })
  ownerId: string;

  // Date & Time
  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  // Pricing
  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 0 })
  basePrice: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 0, default: 0 })
  discountAmount: number;

  @Column({ name: 'final_price', type: 'decimal', precision: 12, scale: 0 })
  finalPrice: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 0, default: 0 })
  depositAmount: number;

  @Column({ name: 'deposit_paid', default: false })
  depositPaid: boolean;

  @Column({ name: 'total_paid', type: 'decimal', precision: 12, scale: 0, default: 0 })
  totalPaid: number;

  // Status
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  // QR Code
  @Column({ name: 'qr_code', unique: true, nullable: true })
  qrCode: string | null;

  @Column({ name: 'qr_verified_at', type: 'timestamptz', nullable: true })
  qrVerifiedAt: Date | null;

  @Column({ name: 'qr_verified_by', nullable: true })
  qrVerifiedBy: string | null;

  // Player Info
  @Column({ name: 'player_name', nullable: true })
  playerName: string | null;

  @Column({ name: 'player_phone', nullable: true })
  playerPhone: string | null;

  @Column({ name: 'player_count', default: 1 })
  playerCount: number;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  // Relations
  @OneToOne(() => BookingPayment)
  @JoinColumn({ name: 'id' })
  payment: BookingPayment;

  @OneToOne(() => Review, (review) => review.booking)
  review: Review;
}
```

### 2.9 Payment Entity

#### `apps/api/src/entities/payment.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { Booking } from './booking.entity';
import { User } from './user.entity';

export enum PaymentMethod {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  WALLET = 'wallet',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  FULL = 'full',
  REFUND = 'refund',
  TOPUP = 'topup',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('booking_payments')
@Index('idx_payments_booking', ['bookingId'])
@Index('idx_payments_status', ['status'])
export class BookingPayment extends BaseEntity {
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.DEPOSIT,
  })
  paymentType: PaymentType;

  @Column({ name: 'gateway_txn_id', nullable: true })
  gatewayTxnId: string | null;

  @Column({ name: 'gateway_data', type: 'jsonb', nullable: true })
  gatewayData: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 0, nullable: true })
  refundAmount: number | null;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt: Date | null;

  @Column({ name: 'refunded_by', nullable: true })
  refundedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'refunded_by' })
  refundByUser: User | null;
}
```

### 2.10 Review Entity

#### `apps/api/src/entities/review.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
import { User } from './user.entity';
import { Court } from './court.entity';
import { Booking } from './booking.entity';

@Entity('reviews')
@Index('idx_reviews_court', ['courtId'])
@Index('idx_reviews_user', ['userId'])
export class Review extends BaseEntity {
  @Column({ name: 'booking_id', unique: true })
  bookingId: string;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => Court, (court) => court.reviews)
  @JoinColumn({ name: 'court_id' })
  court: Court;

  // Ratings (1-5 stars)
  @Column({ name: 'overall_rating' })
  overallRating: number;

  @Column({ name: 'court_rating', nullable: true })
  courtRating: number | null;

  @Column({ name: 'service_rating', nullable: true })
  serviceRating: number | null;

  @Column({ name: 'location_rating', nullable: true })
  locationRating: number | null;

  @Column({ name: 'price_rating', nullable: true })
  priceRating: number | null;

  // Content
  @Column({ length: 200, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  // Media
  @Column({ type: 'jsonb', default: '[]' })
  images: string[];

  // Engagement
  @Column({ name: 'helpful_count', default: 0 })
  helpfulCount: number;

  @Column({ name: 'report_count', default: 0 })
  reportCount: number;

  @Column({ name: 'is_reported', default: false })
  isReported: boolean;

  // Admin
  @Column({ name: 'is_verified', default: true })
  isVerified: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse: string | null;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date | null;
}

@Entity('review_votes')
export class ReviewVote {
  @Column({ name: 'review_id' })
  reviewId: string;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_helpful' })
  isHelpful: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
```

### 2.11 Match Entity (Lên Kèo)

#### `apps/api/src/entities/match.entity.ts`

```typescript
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base/base.entity';
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
@Index('idx_matches_creator', ['creatorId'])
export class Match extends BaseEntity {
  @Column({ name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.matches)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'court_id', nullable: true })
  courtId: string | null;

  @ManyToOne(() => Court, (court) => court.matches, { nullable: true })
  @JoinColumn({ name: 'court_id' })
  court: Court | null;

  @Column({ name: 'sport_id' })
  sportId: number;

  @ManyToOne(() => Sport, (sport) => sport.matches)
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  // Match Info
  @Column({ length: 200, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Requirements
  @Column({ name: 'max_players' })
  maxPlayers: number;

  @Column({ name: 'min_players', default: 1 })
  minPlayers: number;

  @Column({ name: 'current_players', default: 1 })
  currentPlayers: number;

  @Column({ name: 'skill_level', default: 'all' })
  skillLevel: string;

  @Column({ name: 'gender_restrict', default: 'all' })
  genderRestrict: string;

  @Column({ name: 'age_min', nullable: true })
  ageMin: number | null;

  @Column({ name: 'age_max', nullable: true })
  ageMax: number | null;

  // Schedule
  @Column({ name: 'match_date', type: 'date' })
  matchDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 4, scale: 2, default: 1.5 })
  durationHours: number;

  // Location (if not at court)
  @Column({ name: 'location_name', nullable: true })
  locationName: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ name: 'location_address', type: 'text', nullable: true })
  locationAddress: string | null;

  // Cost
  @Column({ name: 'cost_per_person', type: 'decimal', precision: 12, scale: 0, nullable: true })
  costPerPerson: number | null;

  @Column({ name: 'cost_includes', type: 'text', array: true, nullable: true })
  costIncludes: string[] | null;

  @Column({ name: 'is_free', default: false })
  isFree: boolean;

  @Column({ name: 'total_collected', type: 'decimal', precision: 12, scale: 0, default: 0 })
  totalCollected: number;

  // Status
  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.OPEN,
  })
  status: MatchStatus;

  // Features
  @Column({ name: 'has_chat', default: true })
  hasChat: boolean;

  @Column({ name: 'allow_join_request', default: true })
  allowJoinRequest: boolean;

  @Column({ name: 'auto_accept', default: false })
  autoAccept: boolean;

  // Stats
  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'join_count', default: 0 })
  joinCount: number;

  @Column({ name: 'expire_after_hours', default: 72 })
  expireAfterHours: number;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  // Relations
  @OneToMany(() => MatchPlayer, (player) => player.match)
  players: MatchPlayer[];

  @OneToMany(() => MatchMessage, (message) => message.match)
  messages: MatchMessage[];
}

@Entity('match_players')
export class MatchPlayer extends BaseEntity {
  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'accepted' })
  role: string;

  @Column({ name: 'payment_status', default: 'pending' })
  paymentStatus: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 0, nullable: true })
  amountPaid: number | null;

  @Column({ name: 'checked_in', default: false })
  checkedIn: boolean;

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt: Date | null;

  @Column({ nullable: true })
  note: string | null;
}

@Entity('match_messages')
export class MatchMessage extends BaseEntity {
  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, (match) => match.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'message_type', default: 'text' })
  messageType: string;

  @Column()
  content: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
```

### 2.12 Tạo index cho entities

Tạo file `entities/index.ts` để export tất cả entities:

```typescript
// Base
export * from './base/base.entity';

// User
export * from './user.entity';
export * from './user-role.entity';
export * from './user-rank.entity';

// Court
export * from './court.entity';
export * from './sport.entity';
export * from './amenity.entity';

// Booking
export * from './booking.entity';
export * from './payment.entity';
export * from './review.entity';

// Match
export * from './match.entity';
```

---

## Cấu Hình TypeORM DataSource

### 3.1 Tạo `apps/api/src/database/data-source.ts`

```typescript
import { DataSource, DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sport_hub',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [],
  migrationsTableName: 'typeorm_migrations',
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  },
};

export const AppDataSource = new DataSource(config);
```

### 3.2 Cập nhật `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config/configuration';

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
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
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
  ],
})
export class AppModule {}
```

---

## Tạo Migrations

### 4.1 Cập nhật `apps/api/package.json`

Thêm scripts cho migrations:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/data-source.ts",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run -d src/database/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/data-source.ts",
    "migration:show": "npm run typeorm -- migration:show -d src/database/data-source.ts"
  }
}
```

### 4.2 Tạo Migration Đầu Tiên

#### `apps/api/src/database/migrations/1705000000000-InitialSchema.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1705000000000 implements MigrationInterface {
  name = 'InitialSchema1705000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // Create ENUM Types
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('pending', 'active', 'inactive', 'banned')
    `);
    await queryRunner.query(`
      CREATE TYPE "auth_provider_enum" AS ENUM ('email', 'google', 'facebook', 'apple')
    `);
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "court_status_enum" AS ENUM ('pending', 'active', 'inactive', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM (
        'pending_payment', 'pending_confirmation', 'confirmed',
        'checked_in', 'completed', 'cancelled', 'no_show', 'refunded'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM (
        'vnpay', 'momo', 'zalopay', 'bank_transfer', 'cash', 'wallet'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_type_enum" AS ENUM ('deposit', 'full', 'refund', 'topup')
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM (
        'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "match_status_enum" AS ENUM (
        'open', 'full', 'in_progress', 'completed', 'cancelled', 'expired'
      )
    `);

    // ============================================
    // User Ranks (must come before users)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_ranks" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL,
        "slug" VARCHAR(50) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "min_matches" INT NOT NULL,
        "max_matches" INT,
        "color" VARCHAR(7),
        "benefits" JSONB DEFAULT '[]',
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // User Roles
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL UNIQUE,
        "slug" VARCHAR(50) UNIQUE NOT NULL,
        "description" TEXT,
        "permissions" JSONB DEFAULT '[]',
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Users
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255),
        "phone" VARCHAR(20) UNIQUE,
        "full_name" VARCHAR(100) NOT NULL,
        "avatar_url" TEXT,
        "date_of_birth" DATE,
        "gender" gender_enum,
        "bio" TEXT,
        "status" user_status_enum DEFAULT 'active',
        "email_verified" BOOLEAN DEFAULT FALSE,
        "phone_verified" BOOLEAN DEFAULT FALSE,
        "rank_id" INT REFERENCES user_ranks(id),
        "total_points" INT DEFAULT 0,
        "total_matches" INT DEFAULT 0,
        "total_bookings" INT DEFAULT 0,
        "auth_provider" auth_provider_enum DEFAULT 'email',
        "provider_id" VARCHAR(255),
        "follower_count" INT DEFAULT 0,
        "following_count" INT DEFAULT 0,
        "post_count" INT DEFAULT 0,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        "last_login_at" TIMESTAMPTZ
      )
    `);

    // ============================================
    // User Role Mappings
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_role_mappings" (
        "user_id" UUID REFERENCES users(id) ON DELETE CASCADE,
        "role_id" INT REFERENCES user_roles(id) ON DELETE CASCADE,
        "assigned_at" TIMESTAMPTZ DEFAULT NOW(),
        "assigned_by" UUID REFERENCES users(id),
        PRIMARY KEY (user_id, role_id)
      )
    `);

    // ============================================
    // Sports
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "sports" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "description" TEXT,
        "court_count" INT DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Amenities
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "amenities" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "category" VARCHAR(50),
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Courts
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "courts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" UUID NOT NULL REFERENCES users(id),
        "name" VARCHAR(200) NOT NULL,
        "slug" VARCHAR(200) UNIQUE NOT NULL,
        "description" TEXT,
        "address" TEXT NOT NULL,
        "province" VARCHAR(100),
        "district" VARCHAR(100),
        "ward" VARCHAR(100),
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "phone" VARCHAR(20),
        "email" VARCHAR(255),
        "website" TEXT,
        "facebook_url" TEXT,
        "base_price" DECIMAL(12, 0) NOT NULL,
        "price_unit" VARCHAR(10) DEFAULT 'hour',
        "weekend_price" DECIMAL(12, 0),
        "peak_hour_price" DECIMAL(12, 0),
        "open_time" VARCHAR(10) DEFAULT '06:00',
        "close_time" VARCHAR(10) DEFAULT '22:00',
        "slot_duration" INT DEFAULT 60,
        "avg_rating" DECIMAL(3, 2) DEFAULT 0,
        "total_reviews" INT DEFAULT 0,
        "total_bookings" INT DEFAULT 0,
        "total_revenue" DECIMAL(15, 0) DEFAULT 0,
        "cover_image_url" TEXT,
        "status" court_status_enum DEFAULT 'pending',
        "is_featured" BOOLEAN DEFAULT FALSE,
        "is_verified" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Court Sports (Junction Table)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_sports" (
        "court_id" UUID REFERENCES courts(id) ON DELETE CASCADE,
        "sport_id" INT REFERENCES sports(id) ON DELETE CASCADE,
        "price" DECIMAL(12, 0),
        "is_primary" BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (court_id, sport_id)
      )
    `);

    // ============================================
    // Court Amenities (Junction Table)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_amenities" (
        "court_id" UUID REFERENCES courts(id) ON DELETE CASCADE,
        "amenity_id" INT REFERENCES amenities(id) ON DELETE CASCADE,
        PRIMARY KEY (court_id, amenity_id)
      )
    `);

    // ============================================
    // Court Images
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_images" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "court_id" UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
        "url" TEXT NOT NULL,
        "caption" VARCHAR(255),
        "type" VARCHAR(20) DEFAULT 'gallery',
        "sort_order" INT DEFAULT 0,
        "is_verified" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Bookings
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_code" VARCHAR(20) UNIQUE NOT NULL,
        "user_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID NOT NULL REFERENCES courts(id),
        "sport_id" INT REFERENCES sports(id),
        "owner_id" UUID NOT NULL,
        "booking_date" DATE NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME NOT NULL,
        "duration_minutes" INT NOT NULL,
        "base_price" DECIMAL(12, 0) NOT NULL,
        "discount_amount" DECIMAL(12, 0) DEFAULT 0,
        "final_price" DECIMAL(12, 0) NOT NULL,
        "deposit_amount" DECIMAL(12, 0) DEFAULT 0,
        "deposit_paid" BOOLEAN DEFAULT FALSE,
        "total_paid" DECIMAL(12, 0) DEFAULT 0,
        "status" booking_status_enum DEFAULT 'pending_payment',
        "qr_code" TEXT UNIQUE,
        "qr_verified_at" TIMESTAMPTZ,
        "qr_verified_by" UUID REFERENCES users(id),
        "player_name" VARCHAR(100),
        "player_phone" VARCHAR(20),
        "player_count" INT DEFAULT 1,
        "notes" TEXT,
        "cancellation_reason" TEXT,
        "cancelled_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Booking Payments
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "booking_payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        "amount" DECIMAL(12, 0) NOT NULL,
        "payment_method" payment_method_enum,
        "payment_type" payment_type_enum DEFAULT 'deposit',
        "gateway_txn_id" VARCHAR(100),
        "gateway_data" JSONB,
        "status" payment_status_enum DEFAULT 'pending',
        "refund_amount" DECIMAL(12, 0),
        "refund_reason" TEXT,
        "refunded_at" TIMESTAMPTZ,
        "refunded_by" UUID REFERENCES users(id),
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Reviews
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" UUID UNIQUE NOT NULL REFERENCES bookings(id),
        "user_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID NOT NULL REFERENCES courts(id),
        "overall_rating" INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
        "court_rating" INT CHECK (court_rating BETWEEN 1 AND 5),
        "service_rating" INT CHECK (service_rating BETWEEN 1 AND 5),
        "location_rating" INT CHECK (location_rating BETWEEN 1 AND 5),
        "price_rating" INT CHECK (price_rating BETWEEN 1 AND 5),
        "title" VARCHAR(200),
        "content" TEXT,
        "images" JSONB DEFAULT '[]',
        "helpful_count" INT DEFAULT 0,
        "report_count" INT DEFAULT 0,
        "is_reported" BOOLEAN DEFAULT FALSE,
        "is_verified" BOOLEAN DEFAULT TRUE,
        "is_featured" BOOLEAN DEFAULT FALSE,
        "admin_response" TEXT,
        "responded_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Review Votes
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "review_votes" (
        "review_id" UUID REFERENCES reviews(id) ON DELETE CASCADE,
        "user_id" UUID REFERENCES users(id) ON DELETE CASCADE,
        "is_helpful" BOOLEAN NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (review_id, user_id)
      )
    `);

    // ============================================
    // Matches
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "creator_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID REFERENCES courts(id),
        "sport_id" INT NOT NULL REFERENCES sports(id),
        "title" VARCHAR(200),
        "description" TEXT,
        "max_players" INT NOT NULL,
        "min_players" INT DEFAULT 1,
        "current_players" INT DEFAULT 1,
        "skill_level" VARCHAR(20) DEFAULT 'all',
        "gender_restrict" VARCHAR(20) DEFAULT 'all',
        "age_min" INT,
        "age_max" INT,
        "match_date" DATE NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME,
        "duration_hours" DECIMAL(4, 2) DEFAULT 1.5,
        "location_name" VARCHAR(255),
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "location_address" TEXT,
        "cost_per_person" DECIMAL(12, 0),
        "cost_includes" TEXT[],
        "is_free" BOOLEAN DEFAULT FALSE,
        "total_collected" DECIMAL(12, 0) DEFAULT 0,
        "status" match_status_enum DEFAULT 'open',
        "has_chat" BOOLEAN DEFAULT TRUE,
        "allow_join_request" BOOLEAN DEFAULT TRUE,
        "auto_accept" BOOLEAN DEFAULT FALSE,
        "view_count" INT DEFAULT 0,
        "join_count" INT DEFAULT 0,
        "expire_after_hours" INT DEFAULT 72,
        "expires_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Match Players
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "match_players" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES users(id),
        "role" VARCHAR(20) DEFAULT 'accepted',
        "payment_status" VARCHAR(20) DEFAULT 'pending',
        "amount_paid" DECIMAL(12, 0),
        "checked_in" BOOLEAN DEFAULT FALSE,
        "checked_in_at" TIMESTAMPTZ,
        "note" VARCHAR(255),
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(match_id, user_id)
      )
    `);

    // ============================================
    // Match Messages
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "match_messages" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        "sender_id" UUID NOT NULL REFERENCES users(id),
        "message_type" VARCHAR(20) DEFAULT 'text',
        "content" TEXT NOT NULL,
        "is_deleted" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Indexes
    // ============================================
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_phone" ON "users"("phone")`);
    await queryRunner.query(`CREATE INDEX "idx_users_status" ON "users"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_users_rank" ON "users"("rank_id")`);
    await queryRunner.query(`CREATE INDEX "idx_courts_owner" ON "courts"("owner_id")`);
    await queryRunner.query(`CREATE INDEX "idx_courts_status" ON "courts"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_courts_location" ON "courts"("province", "district")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_user" ON "bookings"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_court" ON "bookings"("court_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_date" ON "bookings"("booking_date")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_status" ON "bookings"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_reviews_court" ON "reviews"("court_id")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_sport" ON "matches"("sport_id")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_date" ON "matches"("match_date")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_status" ON "matches"("status")`);

    // ============================================
    // Seed Data
    // ============================================
    // Seed User Ranks
    await queryRunner.query(`
      INSERT INTO "user_ranks" (name, slug, min_matches, max_matches, color, benefits) VALUES
      ('Tân binh', 'rookie', 0, 5, '#9CA3AF', '[]'),
      ('Nghiệp dư', 'amateur', 6, 20, '#22C55E', '["discount_3"]'),
      ('Chuyên nghiệp', 'pro', 21, 50, '#3B82F6', '["discount_5", "priority_booking"]'),
      ('Cao thủ', 'expert', 51, 100, '#F59E0B', '["discount_7", "priority_booking"]'),
      ('Huyền thoại', 'legend', 101, NULL, '#EF4444', '["discount_10", "priority_booking", "free_ranking", "vip_support"]')
    `);

    // Seed User Roles
    await queryRunner.query(`
      INSERT INTO "user_roles" (name, slug, permissions) VALUES
      ('Player', 'player', '["book:create", "review:create", "match:create"]'),
      ('Court Owner', 'court_owner', '["court:manage", "booking:view", "stats:view"]'),
      ('Admin', 'admin', '["user:manage", "court:approve", "content:moderate"]'),
      ('Super Admin', 'super_admin', '["*:all"]')
    `);

    // Seed Sports
    await queryRunner.query(`
      INSERT INTO "sports" (name, slug, icon_url, description) VALUES
      ('Bóng đá 5', 'football-5', '/icons/football-5.png', 'Sân bóng đá 5 người'),
      ('Bóng đá 7', 'football-7', '/icons/football-7.png', 'Sân bóng đá 7 người'),
      ('Cầu lông', 'badminton', '/icons/badminton.png', 'Sân cầu lông'),
      ('Tennis', 'tennis', '/icons/tennis.png', 'Sân tennis'),
      ('Bóng rổ', 'basketball', '/icons/basketball.png', 'Sân bóng rổ'),
      ('Pickleball', 'pickleball', '/icons/pickleball.png', 'Sân pickleball'),
      ('Bóng chuyền', 'volleyball', '/icons/volleyball.png', 'Sân bóng chuyền')
    `);

    // Seed Amenities
    await queryRunner.query(`
      INSERT INTO "amenities" (name, slug, category) VALUES
      ('Máy lạnh', 'air_conditioner', 'facility'),
      ('WiFi miễn phí', 'wifi_free', 'facility'),
      ('Chỗ để xe', 'parking', 'facility'),
      ('Phòng thay đồ', 'changing_room', 'facility'),
      ('Nước uống miễn phí', 'water_free', 'service'),
      ('Thuê vợt', 'racket_rental', 'equipment'),
      ('Cafe', 'cafe', 'service')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "match_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "match_players"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "review_votes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_sports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_role_mappings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_ranks"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "match_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "court_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
  }
}
```

---

## Tạo Base Classes

### 5.1 Base Repository

#### `apps/api/src/common/repositories/base.repository.ts`

```typescript
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  SaveOptions,
} from 'typeorm';

export abstract class BaseRepository<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findById(id: string | number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findByIds(ids: (string | number)[]): Promise<T[]> {
    return this.repository.findBy({ id: ids as any } as FindOptionsWhere<T>);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return this.repository.save(entity as any);
  }

  async save(entity: T, options?: SaveOptions): Promise<T> {
    return this.repository.save(entity as any, options);
  }

  async update(id: string | number, data: DeepPartial<T>): Promise<void> {
    await this.repository.update(id as any, data as any);
  }

  async delete(id: string | number): Promise<void> {
    await this.repository.delete(id as any);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }
}
```

### 5.2 Base Service

#### `apps/api/src/common/services/base.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseRepository } from '../repositories/base.repository';

@Injectable()
export abstract class BaseService<
  Entity,
  CreateDto,
  UpdateDto,
  Repo extends BaseRepository<Entity>,
> {
  protected constructor(protected readonly repository: Repo) {}

  async findAll(...args: any[]): Promise<Entity[]> {
    return this.repository.findAll(...args);
  }

  async findOne(...args: any[]): Promise<Entity | null> {
    return this.repository.findOne(...args);
  }

  async findById(id: string | number): Promise<Entity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return entity;
  }

  async create(data: CreateDto): Promise<Entity> {
    return this.repository.create(data as any);
  }

  async update(id: string | number, data: UpdateDto): Promise<Entity> {
    const entity = await this.findById(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: string | number): Promise<void> {
    await this.findById(id); // Ensure exists
    await this.repository.delete(id);
  }

  protected abstract get entityName(): string;
}
```

---

## Testing

### 6.1 Chạy Migrations

```bash
cd apps/api

# Chạy migrations
npm run migration:run

# Xem trạng thái migrations
npm run migration:show
```

### 6.2 Verify Database

Kiểm tra database đã được tạo đầy đủ:

```sql
-- Kết nối PostgreSQL
psql -h localhost -U postgres -d sport_hub

-- Kiểm tra tables
\dt

-- Kiểm tra seed data
SELECT * FROM "user_ranks";
SELECT * FROM "user_roles";
SELECT * FROM "sports";
SELECT * FROM "amenities";
```

### 6.3 Test API với Entities

Restart server và kiểm tra:

```bash
npm run start:dev
```

---

## Review Checklist

### Phase 2 Complete Checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Cài TypeORM dependencies | ⬜ | |
| 2 | Tạo Base Entity | ⬜ | |
| 3 | Tạo User Entity | ⬜ | |
| 4 | Tạo UserRole Entity | ⬜ | |
| 5 | Tạo UserRank Entity | ⬜ | |
| 6 | Tạo Sport Entity | ⬜ | |
| 7 | Tạo Amenity Entity | ⬜ | |
| 8 | Tạo Court Entity | ⬜ | |
| 9 | Tạo Booking Entity | ⬜ | |
| 10 | Tạo Payment Entity | ⬜ | |
| 11 | Tạo Review Entity | ⬜ | |
| 12 | Tạo Match Entity | ⬜ | |
| 13 | Cấu hình DataSource | ⬜ | |
| 14 | Tạo Initial Migration | ⬜ | |
| 15 | Chạy Migration | ⬜ | |
| 16 | Tạo Base Repository | ⬜ | |
| 17 | Tạo Base Service | ⬜ | |
| 18 | Verify Database | ⬜ | |

### Questions for Review

Trước khi qua Phase 3, hãy xác nhận:

1. ✅ Tất cả entities được tạo đúng
2. ✅ Migration chạy thành công
3. ✅ Database có đầy đủ tables
4. ✅ Seed data được insert
5. ✅ Không có lỗi TypeScript

---

## Next Steps

Sau khi Phase 2 hoàn thành và được review:

➡️ **Phase 3: Auth Module**
- Register/Login endpoints
- JWT tokens
- Auth guards
- Password hashing

➡️ **Phase 4: User Module**
- User CRUD
- Profile management
- Avatar upload

➡️ **Phase 5: Court Module**
- Court CRUD
- Court search
- Court images

---

## Liên Hệ

Nếu gặp lỗi:
1. Kiểm tra Docker logs: `docker-compose logs postgres`
2. Chạy lại migration: `npm run migration:revert && npm run migration:run`
3. Xóa database và tạo lại: `docker-compose down -v`

---

**Version:** 1.0
**Last Updated:** 2026-05-10
