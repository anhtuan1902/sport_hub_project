// Payment Types

export enum PaymentMethod {
  CASH = 'cash',
  VNPAY = 'vnpay',
  ZALOPAY = 'zalopay',
  MOMO = 'momo',
  BANKING = 'banking',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentProvider {
  VNPAY = 'vnpay',
  ZALOPAY = 'zalopay',
  MOMO = 'momo',
}

// Payment Entity
export interface Payment {
  id: string;
  userId: string;
  user?: any;
  bookingId: string;
  booking?: any;
  amount: number;
  method: PaymentMethod;
  provider: PaymentProvider | null;
  status: PaymentStatus;
  transactionId: string | null;
  paymentUrl: string | null;
  returnUrl: string | null;
  metadata: Record<string, any>;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Create Payment DTO
export interface CreatePaymentDto {
  bookingId: string;
  method: PaymentMethod;
  returnUrl?: string;
}

// Payment Callback DTO
export interface PaymentCallbackDto {
  transactionId: string;
  status: string;
  amount: number;
  orderInfo: string;
}
