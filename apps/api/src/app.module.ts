import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { CourtsModule } from './modules/courts';
import { SportsModule } from './modules/sports';
import { AmenitiesModule } from './modules/amenities';
import { BookingsModule } from './modules/bookings';
import { ReviewsModule } from './modules/reviews';
import { MatchesModule } from './modules/matches';
import { PaymentsModule } from './modules/payments';
import { NotificationsModule } from './modules/notifications';
import { ChatModule } from './modules/chat';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import configuration from './config/configuration';

// Entities
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRoleMapping } from './entities/user-role.entity';
import { UserRank } from './entities/user-rank.entity';
import { Sport } from './entities/sport.entity';
import { Amenity } from './entities/amenity.entity';
import { Court, CourtSport, CourtAmenity } from './entities/court.entity';
import { CourtImage } from './entities/court-image.entity';
import { Booking } from './entities/booking.entity';
import { BookingPayment } from './entities/payment.entity';
import { Review, ReviewVote } from './entities/review.entity';
import { Match, MatchPlayer, MatchMessage } from './entities/match.entity';
import { Notification } from './entities/notification.entity';
import { Conversation, ConversationParticipant, Message } from './modules/chat/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url') || 'postgresql://postgres:postgres123@localhost:5432/sport_hub',
        entities: [
          User,
          UserRole,
          UserRoleMapping,
          UserRank,
          Sport,
          Amenity,
          Court,
          CourtSport,
          CourtAmenity,
          CourtImage,
          Booking,
          BookingPayment,
          Review,
          ReviewVote,
          Match,
          MatchPlayer,
          MatchMessage,
          Notification,
          Conversation,
          ConversationParticipant,
          Message,
        ],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CourtsModule,
    SportsModule,
    AmenitiesModule,
    BookingsModule,
    ReviewsModule,
    MatchesModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
