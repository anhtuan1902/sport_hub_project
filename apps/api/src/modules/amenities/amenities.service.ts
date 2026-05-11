import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from '../../entities/amenity.entity';
import { CreateAmenityDto, UpdateAmenityDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
  ) {}

  async findAll(): Promise<Amenity[]> {
    return this.amenityRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOne({ where: { id } });
    if (!amenity) {
      throw new NotFoundException('Amenity không tồn tại');
    }
    return amenity;
  }

  async findBySlug(slug: string): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOne({ where: { slug } });
    if (!amenity) {
      throw new NotFoundException('Amenity không tồn tại');
    }
    return amenity;
  }

  async create(dto: CreateAmenityDto): Promise<Amenity> {
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true, locale: 'vi' });

    const existing = await this.amenityRepository.findOne({ where: { slug } });
    if (existing) {
      throw new Error('Amenity với slug này đã tồn tại');
    }

    const amenity = this.amenityRepository.create({
      name: dto.name,
      slug,
      iconUrl: dto.iconUrl,
      category: dto.category,
    });

    return this.amenityRepository.save(amenity);
  }

  async update(id: number, dto: UpdateAmenityDto): Promise<Amenity> {
    const amenity = await this.findById(id);

    if (dto.name) amenity.name = dto.name;
    if (dto.iconUrl !== undefined) amenity.iconUrl = dto.iconUrl;
    if (dto.category !== undefined) amenity.category = dto.category;
    if (dto.isActive !== undefined) amenity.isActive = dto.isActive;

    return this.amenityRepository.save(amenity);
  }

  async delete(id: number): Promise<{ message: string }> {
    const amenity = await this.findById(id);
    await this.amenityRepository.remove(amenity);
    return { message: 'Xóa amenity thành công' };
  }
}
