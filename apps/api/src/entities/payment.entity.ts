import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

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
export class BookingPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true, name: 'payment_method' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.DEPOSIT, name: 'payment_type' })
  paymentType: PaymentType;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'gateway_txn_id' })
  gatewayTxnId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'gateway_data' })
  gatewayData: any;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 0, nullable: true, name: 'refund_amount' })
  refundAmount: number;

  @Column({ type: 'text', nullable: true, name: 'refund_reason' })
  refundReason: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'refunded_at' })
  refundedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'refunded_by' })
  refundedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
