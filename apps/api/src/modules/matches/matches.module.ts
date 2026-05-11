import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchGateway } from './match.gateway';
import { Match, MatchPlayer, MatchMessage } from '../../entities/match.entity';
import { Court } from '../../entities/court.entity';
import { Sport } from '../../entities/sport.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, MatchPlayer, MatchMessage, Court, Sport, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '123456789aT',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchGateway],
  exports: [MatchesService],
})
export class MatchesModule {}
