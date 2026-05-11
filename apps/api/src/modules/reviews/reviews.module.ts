import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review, ReviewVote } from '../../entities/review.entity';
import { Booking } from '../../entities/booking.entity';
import { Court } from '../../entities/court.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewVote, Booking, Court])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
