import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
@Index('idx_bookings_date', ['bookingDate'])
@Index('idx_bookings_status', ['status'])
@Index('idx_bookings_code', ['bookingCode'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, name: 'booking_code', unique: true })
  bookingCode: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'court_id' })
  courtId: string;

  @Column({ type: 'int', name: 'sport_id', nullable: true })
  sportId: number;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: Date;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'base_price' })
  basePrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'final_price' })
  finalPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'deposit_amount', default: 0 })
  depositAmount: number;

  @Column({ type: 'boolean', name: 'deposit_paid', default: false })
  depositPaid: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 0, name: 'total_paid', default: 0 })
  totalPaid: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING_PAYMENT })
  status: BookingStatus;

  @Column({ type: 'text', name: 'qr_code', unique: true, nullable: true })
  qrCode: string;

  @Column({ type: 'timestamptz', name: 'qr_verified_at', nullable: true })
  qrVerifiedAt: Date;

  @Column({ type: 'uuid', name: 'qr_verified_by', nullable: true })
  qrVerifiedBy: string;

  @Column({ type: 'varchar', length: 100, name: 'player_name', nullable: true })
  playerName: string;

  @Column({ type: 'varchar', length: 20, name: 'player_phone', nullable: true })
  playerPhone: string;

  @Column({ type: 'int', name: 'player_count', default: 1 })
  playerCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @Column({ type: 'timestamptz', name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
