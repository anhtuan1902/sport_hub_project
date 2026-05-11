import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole, UserRoleMapping } from '../entities/user-role.entity';
import { UserRank } from '../entities/user-rank.entity';
import { Sport } from '../entities/sport.entity';
import { Amenity } from '../entities/amenity.entity';
import { Court, CourtSport, CourtAmenity } from '../entities/court.entity';
import { CourtImage } from '../entities/court-image.entity';
import { Booking } from '../entities/booking.entity';
import { BookingPayment } from '../entities/payment.entity';
import { Review, ReviewVote } from '../entities/review.entity';
import { Match, MatchPlayer, MatchMessage } from '../entities/match.entity';

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sport_hub',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
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
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
  migrationsTableName: 'typeorm_migrations',
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  },
};

export default new DataSource(config);
