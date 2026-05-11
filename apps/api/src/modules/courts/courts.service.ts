import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, In } from 'typeorm';
import { Court, CourtSport, CourtAmenity, CourtStatus } from '../../entities/court.entity';
import { CourtImage } from '../../entities/court-image.entity';
import { Sport } from '../../entities/sport.entity';
import { Amenity } from '../../entities/amenity.entity';
import {
  CreateCourtDto,
  UpdateCourtDto,
  CourtQueryDto,
  CourtResponseDto,
  CourtListResponseDto,
} from './dto';
import slugify from 'slugify';

@Injectable()
export class CourtsService {
  private readonly logger = new Logger(CourtsService.name);

  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(CourtSport)
    private courtSportRepository: Repository<CourtSport>,
    @InjectRepository(CourtAmenity)
    private courtAmenityRepository: Repository<CourtAmenity>,
    @InjectRepository(CourtImage)
    private courtImageRepository: Repository<CourtImage>,
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async create(ownerId: string, dto: CreateCourtDto): Promise<CourtResponseDto> {
    const slug = this.generateSlug(dto.name);

    const existingSlug = await this.courtRepository.findOne({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const court = this.courtRepository.create({
      ownerId,
      name: dto.name,
      slug: finalSlug,
      description: dto.description,
      address: dto.address,
      province: dto.province,
      district: dto.district,
      ward: dto.ward,
      latitude: dto.latitude,
      longitude: dto.longitude,
      phone: dto.phone,
      email: dto.email,
      website: dto.website,
      facebookUrl: dto.facebookUrl,
      basePrice: dto.basePrice,
      priceUnit: dto.priceUnit || 'hour',
      weekendPrice: dto.weekendPrice,
      peakHourPrice: dto.peakHourPrice,
      openTime: dto.openTime || '06:00',
      closeTime: dto.closeTime || '22:00',
      slotDuration: dto.slotDuration || 60,
      status: CourtStatus.PENDING,
    });

    const savedCourt = await this.courtRepository.save(court);

    if (dto.sportIds && dto.sportIds.length > 0) {
      await this.assignSports(savedCourt.id, dto.sportIds);
    }

    if (dto.amenityIds && dto.amenityIds.length > 0) {
      await this.assignAmenities(savedCourt.id, dto.amenityIds);
    }

    return this.findOne(savedCourt.id);
  }

  async findAll(query: CourtQueryDto): Promise<CourtListResponseDto> {
    const {
      query: searchQuery,
      sportId,
      province,
      district,
      minPrice,
      maxPrice,
      amenities,
      status,
      verifiedOnly,
      featuredOnly,
      lat,
      lng,
      radius,
      sort = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.courtRepository
      .createQueryBuilder('court')
      .leftJoinAndSelect('court.courtSports', 'courtSports')
      .leftJoinAndSelect('courtSports.sport', 'sport')
      .leftJoinAndSelect('court.courtAmenities', 'courtAmenities')
      .leftJoinAndSelect('courtAmenities.amenity', 'amenity')
      .leftJoinAndSelect('court.images', 'images');

    if (searchQuery) {
      queryBuilder.andWhere(
        '(court.name ILIKE :query OR court.description ILIKE :query OR court.address ILIKE :query)',
        { query: `%${searchQuery}%` },
      );
    }

    if (province) {
      queryBuilder.andWhere('court.province ILIKE :province', { province: `%${province}%` });
    }

    if (district) {
      queryBuilder.andWhere('court.district ILIKE :district', { district: `%${district}%` });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('court.basePrice >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('court.basePrice <= :maxPrice', { maxPrice });
    }

    if (sportId) {
      queryBuilder.andWhere('courtSports.sportId = :sportId', { sportId });
    }

    if (status) {
      queryBuilder.andWhere('court.status = :status', { status });
    } else {
      queryBuilder.andWhere('court.status = :activeStatus', {
        activeStatus: CourtStatus.ACTIVE,
      });
    }

    if (verifiedOnly) {
      queryBuilder.andWhere('court.isVerified = :verified', { verified: true });
    }

    if (featuredOnly) {
      queryBuilder.andWhere('court.isFeatured = :featured', { featured: true });
    }

    if (amenities) {
      const amenityIds = amenities.split(',').map((id) => parseInt(id.trim(), 10));
      queryBuilder.andWhere('courtAmenities.amenityId IN (:...amenityIds)', { amenityIds });
    }

    const sortField = this.getSortField(sort);
    queryBuilder.orderBy(sortField, order);

    const total = await queryBuilder.getCount();
    const courts = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const mappedCourts = courts.map((court) => this.mapCourtToResponse(court));

    if (lat && lng && radius) {
      mappedCourts.forEach((court) => {
        if (court.latitude && court.longitude) {
          court.distance = this.calculateDistance(
            lat,
            lng,
            court.latitude,
            court.longitude,
          );
        }
      });

      mappedCourts.sort((a, b) => (a.distance || 999) - (b.distance || 999));

      const maxDistance = radius;
      const filteredCourts = mappedCourts.filter(
        (court) => court.distance !== undefined && court.distance <= maxDistance,
      );

      return {
        data: filteredCourts,
        total: filteredCourts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCourts.length / limit),
        hasNext: page < Math.ceil(filteredCourts.length / limit),
        hasPrev: page > 1,
      };
    }

    return {
      data: mappedCourts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<CourtResponseDto> {
    const court = await this.courtRepository.findOne({
      where: { id },
      relations: ['courtSports', 'courtSports.sport', 'courtAmenities', 'courtAmenities.amenity', 'images'],
    });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    return this.mapCourtToResponse(court);
  }

  async findBySlug(slug: string): Promise<CourtResponseDto> {
    const court = await this.courtRepository.findOne({
      where: { slug },
      relations: ['courtSports', 'courtSports.sport', 'courtAmenities', 'courtAmenities.amenity', 'images'],
    });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    return this.mapCourtToResponse(court);
  }

  async findByOwner(ownerId: string, page = 1, limit = 20): Promise<CourtListResponseDto> {
    const [courts, total] = await this.courtRepository.findAndCount({
      where: { ownerId },
      relations: ['courtSports', 'courtSports.sport', 'courtAmenities', 'courtAmenities.amenity', 'images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: courts.map((court) => this.mapCourtToResponse(court)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    const court = await this.courtRepository.findOne({ where: { id } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật sân này');
    }

    const updateData: Partial<Court> = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.address) updateData.address = dto.address;
    if (dto.province !== undefined) updateData.province = dto.province;
    if (dto.district !== undefined) updateData.district = dto.district;
    if (dto.ward !== undefined) updateData.ward = dto.ward;
    if (dto.latitude !== undefined) updateData.latitude = dto.latitude;
    if (dto.longitude !== undefined) updateData.longitude = dto.longitude;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.website !== undefined) updateData.website = dto.website;
    if (dto.facebookUrl !== undefined) updateData.facebookUrl = dto.facebookUrl;
    if (dto.basePrice !== undefined) updateData.basePrice = dto.basePrice;
    if (dto.priceUnit !== undefined) updateData.priceUnit = dto.priceUnit;
    if (dto.weekendPrice !== undefined) updateData.weekendPrice = dto.weekendPrice;
    if (dto.peakHourPrice !== undefined) updateData.peakHourPrice = dto.peakHourPrice;
    if (dto.openTime !== undefined) updateData.openTime = dto.openTime;
    if (dto.closeTime !== undefined) updateData.closeTime = dto.closeTime;
    if (dto.slotDuration !== undefined) updateData.slotDuration = dto.slotDuration;
    if (dto.coverImageUrl !== undefined) updateData.coverImageUrl = dto.coverImageUrl;

    if (dto.name && dto.name !== court.name) {
      const newSlug = this.generateSlug(dto.name);
      const existingSlug = await this.courtRepository.findOne({
        where: { slug: newSlug },
      });
      updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug;
    }

    await this.courtRepository.update(id, updateData);

    if (dto.sportIds !== undefined) {
      await this.assignSports(id, dto.sportIds);
    }

    if (dto.amenityIds !== undefined) {
      await this.assignAmenities(id, dto.amenityIds);
    }

    return this.findOne(id);
  }

  async delete(id: string, ownerId: string): Promise<{ message: string }> {
    const court = await this.courtRepository.findOne({ where: { id } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa sân này');
    }

    await this.courtRepository.remove(court);

    return { message: 'Xóa sân thành công' };
  }

  async updateStatus(
    id: string,
    status: CourtStatus,
  ): Promise<CourtResponseDto> {
    const court = await this.courtRepository.findOne({ where: { id } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    court.status = status;
    await this.courtRepository.save(court);

    return this.findOne(id);
  }

  async addImage(
    courtId: string,
    ownerId: string,
    url: string,
    caption?: string,
    type?: string,
    sortOrder?: number,
  ): Promise<CourtImage> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền thêm hình ảnh cho sân này');
    }

    const image = this.courtImageRepository.create({
      courtId,
      url,
      caption,
      type: type || 'gallery',
      sortOrder: sortOrder || 0,
    });

    return this.courtImageRepository.save(image);
  }

  async deleteImage(
    courtId: string,
    imageId: string,
    ownerId: string,
  ): Promise<{ message: string }> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa hình ảnh này');
    }

    const image = await this.courtImageRepository.findOne({
      where: { id: imageId, courtId },
    });

    if (!image) {
      throw new NotFoundException('Hình ảnh không tồn tại');
    }

    await this.courtImageRepository.remove(image);

    return { message: 'Xóa hình ảnh thành công' };
  }

  async getFeaturedCourts(limit = 10): Promise<CourtResponseDto[]> {
    const courts = await this.courtRepository.find({
      where: { isFeatured: true, status: CourtStatus.ACTIVE },
      relations: ['courtSports', 'courtSports.sport', 'courtAmenities', 'courtAmenities.amenity', 'images'],
      order: { avgRating: 'DESC' },
      take: limit,
    });

    return courts.map((court) => this.mapCourtToResponse(court));
  }

  async getNearbyCourts(
    lat: number,
    lng: number,
    radiusKm = 10,
    limit = 20,
  ): Promise<CourtResponseDto[]> {
    const courts = await this.courtRepository.find({
      where: { status: CourtStatus.ACTIVE },
      relations: ['courtSports', 'courtSports.sport', 'courtAmenities', 'courtAmenities.amenity', 'images'],
    });

    const courtsWithDistance = courts
      .filter((court) => court.latitude && court.longitude)
      .map((court) => ({
        court: this.mapCourtToResponse(court),
        distance: this.calculateDistance(lat, lng, court.latitude!, court.longitude!),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    courtsWithDistance.forEach((item) => {
      item.court.distance = item.distance;
    });

    return courtsWithDistance.map((item) => item.court);
  }

  private async assignSports(courtId: string, sportIds: number[]): Promise<void> {
    await this.courtSportRepository.delete({ courtId });

    const sportDocs = await this.sportRepository.findBy({ id: In(sportIds) });
    if (sportDocs.length !== sportIds.length) {
      throw new BadRequestException('Một số sport không tồn tại');
    }

    const courtSports = sportIds.map((sportId, index) =>
      this.courtSportRepository.create({
        courtId,
        sportId,
        isPrimary: index === 0,
      }),
    );

    await this.courtSportRepository.save(courtSports);
  }

  private async assignAmenities(courtId: string, amenityIds: number[]): Promise<void> {
    await this.courtAmenityRepository.delete({ courtId });

    const amenityDocs = await this.amenityRepository.findBy({ id: In(amenityIds) });
    if (amenityDocs.length !== amenityIds.length) {
      throw new BadRequestException('Một số amenity không tồn tại');
    }

    const courtAmenities = amenityIds.map((amenityId) =>
      this.courtAmenityRepository.create({
        courtId,
        amenityId,
      }),
    );

    await this.courtAmenityRepository.save(courtAmenities);
  }

  private mapCourtToResponse(court: any): CourtResponseDto {
    return {
      id: court.id,
      ownerId: court.ownerId,
      name: court.name,
      slug: court.slug,
      description: court.description,
      address: court.address,
      province: court.province,
      district: court.district,
      ward: court.ward,
      latitude: court.latitude,
      longitude: court.longitude,
      phone: court.phone,
      email: court.email,
      website: court.website,
      facebookUrl: court.facebookUrl,
      basePrice: Number(court.basePrice),
      priceUnit: court.priceUnit,
      weekendPrice: court.weekendPrice ? Number(court.weekendPrice) : undefined,
      peakHourPrice: court.peakHourPrice ? Number(court.peakHourPrice) : undefined,
      openTime: court.openTime,
      closeTime: court.closeTime,
      slotDuration: court.slotDuration,
      avgRating: Number(court.avgRating) || 0,
      totalReviews: court.totalReviews,
      totalBookings: court.totalBookings,
      totalRevenue: Number(court.totalRevenue) || 0,
      coverImageUrl: court.coverImageUrl,
      status: court.status,
      isFeatured: court.isFeatured,
      isVerified: court.isVerified,
      sports: court.courtSports?.map((cs: any) => ({
        id: cs.sport?.id,
        name: cs.sport?.name,
        slug: cs.sport?.slug,
        iconUrl: cs.sport?.iconUrl,
        description: cs.sport?.description,
        courtCount: cs.sport?.courtCount,
        price: cs.price ? Number(cs.price) : undefined,
        isPrimary: cs.isPrimary,
      })) || [],
      amenities: court.courtAmenities?.map((ca: any) => ({
        id: ca.amenity?.id,
        name: ca.amenity?.name,
        slug: ca.amenity?.slug,
        iconUrl: ca.amenity?.iconUrl,
        category: ca.amenity?.category,
      })) || [],
      images: court.images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        type: img.type,
        sortOrder: img.sortOrder,
        isVerified: img.isVerified,
      })) || [],
      distance: court.distance,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    };
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private getSortField(sort: string): string {
    const sortMap: Record<string, string> = {
      price: 'court.basePrice',
      rating: 'court.avgRating',
      createdAt: 'court.createdAt',
      name: 'court.name',
    };
    return sortMap[sort] || 'court.createdAt';
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
