import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from '../../entities/sport.entity';
import { CreateSportDto, UpdateSportDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
  ) {}

  async findAll(): Promise<Sport[]> {
    return this.sportRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<Sport> {
    const sport = await this.sportRepository.findOne({ where: { id } });
    if (!sport) {
      throw new NotFoundException('Sport không tồn tại');
    }
    return sport;
  }

  async findBySlug(slug: string): Promise<Sport> {
    const sport = await this.sportRepository.findOne({ where: { slug } });
    if (!sport) {
      throw new NotFoundException('Sport không tồn tại');
    }
    return sport;
  }

  async create(dto: CreateSportDto): Promise<Sport> {
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true, locale: 'vi' });

    const existing = await this.sportRepository.findOne({ where: { slug } });
    if (existing) {
      throw new Error('Sport với slug này đã tồn tại');
    }

    const sport = this.sportRepository.create({
      name: dto.name,
      slug,
      iconUrl: dto.iconUrl,
      description: dto.description,
    });

    return this.sportRepository.save(sport);
  }

  async update(id: number, dto: UpdateSportDto): Promise<Sport> {
    const sport = await this.findById(id);

    if (dto.name) sport.name = dto.name;
    if (dto.iconUrl !== undefined) sport.iconUrl = dto.iconUrl;
    if (dto.description !== undefined) sport.description = dto.description;
    if (dto.isActive !== undefined) sport.isActive = dto.isActive;

    return this.sportRepository.save(sport);
  }

  async delete(id: number): Promise<{ message: string }> {
    const sport = await this.findById(id);
    await this.sportRepository.remove(sport);
    return { message: 'Xóa sport thành công' };
  }
}
