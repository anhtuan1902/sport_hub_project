import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentType, PaymentStatus } from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.VNPAY })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentType })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;
}

export class PaymentQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class VNPayReturnDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_Amount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_BankCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_BankTranNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_CardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_OrderInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_PayDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_ResponseCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_TmnCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_TransactionNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_TransactionStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_TxnRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vnp_SecureHash?: string;
}

export class RefundPaymentDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  refundAmount: number;

  @ApiPropertyOptional({ example: 'Khách hủy booking' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class PaymentResponseDto {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  gatewayTxnId: string;
  status: PaymentStatus;
  refundAmount: number;
  refundReason: string | null;
  refundedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    id: string;
    bookingCode: string;
    status: string;
  };
}

export class PaymentListResponseDto {
  data: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class VNPayPaymentUrlDto {
  @ApiProperty()
  paymentUrl: string;

  @ApiProperty()
  txnRef: string;
}
