import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CourtStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('courts')
@Index('idx_courts_owner', ['ownerId'])
@Index('idx_courts_status', ['status'])
export class Court {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ward: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  website: string;

  @Column({ type: 'text', name: 'facebook_url', nullable: true })
  facebookUrl: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'base_price' })
  basePrice: number;

  @Column({ type: 'varchar', length: 10, name: 'price_unit', default: 'hour' })
  priceUnit: string;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'weekend_price', nullable: true })
  weekendPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'peak_hour_price', nullable: true })
  peakHourPrice: number;

  @Column({ type: 'varchar', length: 10, name: 'open_time', default: '06:00' })
  openTime: string;

  @Column({ type: 'varchar', length: 10, name: 'close_time', default: '22:00' })
  closeTime: string;

  @Column({ type: 'int', name: 'slot_duration', default: 60 })
  slotDuration: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'avg_rating', default: 0 })
  avgRating: number;

  @Column({ type: 'int', name: 'total_reviews', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', name: 'total_bookings', default: 0 })
  totalBookings: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, name: 'total_revenue', default: 0 })
  totalRevenue: number;

  @Column({ type: 'text', name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column({ type: 'enum', enum: CourtStatus, default: CourtStatus.PENDING })
  status: CourtStatus;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('court_sports')
export class CourtSport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'court_id' })
  courtId: string;

  @Column({ type: 'int', name: 'sport_id' })
  sportId: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true })
  price: number;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;
}

@Entity('court_amenities')
export class CourtAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'court_id' })
  courtId: string;

  @Column({ type: 'int', name: 'amenity_id' })
  amenityId: number;
}
