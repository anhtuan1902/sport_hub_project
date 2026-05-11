import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { Court, CourtSport, CourtAmenity } from '../../entities/court.entity';
import { CourtImage } from '../../entities/court-image.entity';
import { Sport } from '../../entities/sport.entity';
import { Amenity } from '../../entities/amenity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Court,
      CourtSport,
      CourtAmenity,
      CourtImage,
      Sport,
      Amenity,
    ]),
  ],
  controllers: [CourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule {}
