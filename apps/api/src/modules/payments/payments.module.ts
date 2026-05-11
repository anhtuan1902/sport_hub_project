import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BookingPayment } from '../../entities/payment.entity';
import { Booking } from '../../entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingPayment, Booking])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
