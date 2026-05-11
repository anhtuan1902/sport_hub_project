import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Review, ReviewVote } from '../../entities/review.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Court } from '../../entities/court.entity';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewResponseDto,
  ReviewListResponseDto,
  CourtReviewSummaryDto,
} from './dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private reviewVoteRepository: Repository<ReviewVote>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền review booking này');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Chỉ có thể review booking đã hoàn thành');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new ConflictException('Đã có review cho booking này');
    }

    const review = this.reviewRepository.create({
      bookingId: dto.bookingId,
      userId,
      courtId: booking.courtId,
      overallRating: dto.overallRating,
      courtRating: dto.courtRating,
      serviceRating: dto.serviceRating,
      locationRating: dto.locationRating,
      priceRating: dto.priceRating,
      title: dto.title,
      content: dto.content,
      images: dto.images || [],
      isVerified: true,
    });

    const savedReview = await this.reviewRepository.save(review);

    await this.updateCourtRating(booking.courtId);

    return this.findOne(savedReview.id);
  }

  async findAll(query: ReviewQueryDto): Promise<ReviewListResponseDto> {
    const {
      courtId,
      userId,
      isVerified,
      isFeatured,
      isReported,
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user');

    if (courtId) {
      queryBuilder.andWhere('review.courtId = :courtId', { courtId });
    }

    if (userId) {
      queryBuilder.andWhere('review.userId = :userId', { userId });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('review.isVerified = :isVerified', { isVerified });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('review.isFeatured = :isFeatured', { isFeatured });
    }

    if (isReported !== undefined) {
      queryBuilder.andWhere('review.isReported = :isReported', { isReported });
    }

    queryBuilder.orderBy('review.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: reviews.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    return this.mapToResponse(review);
  }

  async findByBooking(bookingId: string): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepository.findOne({
      where: { bookingId },
      relations: ['user'],
    });

    if (!review) {
      return null;
    }

    return this.mapToResponse(review);
  }

  async findByCourt(
    courtId: string,
    page = 1,
    limit = 20,
    sort = 'newest',
  ): Promise<ReviewListResponseDto> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.courtId = :courtId', { courtId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true });

    switch (sort) {
      case 'oldest':
        queryBuilder.orderBy('review.createdAt', 'ASC');
        break;
      case 'highest':
        queryBuilder.orderBy('review.overallRating', 'DESC').addOrderBy('review.createdAt', 'DESC');
        break;
      case 'lowest':
        queryBuilder.orderBy('review.overallRating', 'ASC').addOrderBy('review.createdAt', 'DESC');
        break;
      case 'helpful':
        queryBuilder.orderBy('review.helpfulCount', 'DESC').addOrderBy('review.createdAt', 'DESC');
        break;
      default:
        queryBuilder.orderBy('review.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: reviews.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<ReviewListResponseDto> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: reviews.map((r) => this.mapToResponse(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async getCourtReviewSummary(courtId: string): Promise<CourtReviewSummaryDto> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select([
        'COUNT(*) as totalReviews',
        'AVG(review.overallRating) as avgOverallRating',
        'AVG(review.courtRating) as avgCourtRating',
        'AVG(review.serviceRating) as avgServiceRating',
        'AVG(review.locationRating) as avgLocationRating',
        'AVG(review.priceRating) as avgPriceRating',
      ])
      .where('review.courtId = :courtId', { courtId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true })
      .getRawOne();

    const ratingDistribution = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.overallRating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.courtId = :courtId', { courtId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true })
      .groupBy('review.overallRating')
      .getRawMany();

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[parseInt(item.rating)] = parseInt(item.count);
    });

    return {
      courtId,
      courtName: court.name,
      avgOverallRating: parseFloat(stats.avgOverallRating) || 0,
      avgCourtRating: parseFloat(stats.avgCourtRating) || 0,
      avgServiceRating: parseFloat(stats.avgServiceRating) || 0,
      avgLocationRating: parseFloat(stats.avgLocationRating) || 0,
      avgPriceRating: parseFloat(stats.avgPriceRating) || 0,
      totalReviews: parseInt(stats.totalReviews) || 0,
      ratingDistribution: distribution,
    };
  }

  async update(id: string, userId: string, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật review này');
    }

    const updatedData: Partial<Review> = {};

    if (dto.overallRating !== undefined) updatedData.overallRating = dto.overallRating;
    if (dto.courtRating !== undefined) updatedData.courtRating = dto.courtRating;
    if (dto.serviceRating !== undefined) updatedData.serviceRating = dto.serviceRating;
    if (dto.locationRating !== undefined) updatedData.locationRating = dto.locationRating;
    if (dto.priceRating !== undefined) updatedData.priceRating = dto.priceRating;
    if (dto.title !== undefined) updatedData.title = dto.title;
    if (dto.content !== undefined) updatedData.content = dto.content;
    if (dto.images !== undefined) updatedData.images = dto.images;

    await this.reviewRepository.update(id, updatedData);

    if (dto.overallRating !== undefined) {
      await this.updateCourtRating(review.courtId);
    }

    return this.findOne(id);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa review này');
    }

    await this.reviewRepository.remove(review);

    await this.updateCourtRating(review.courtId);

    return { message: 'Xóa review thành công' };
  }

  async voteHelpful(id: string, userId: string): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    if (review.userId === userId) {
      throw new BadRequestException('Không thể đánh dấu review của chính mình');
    }

    const existingVote = await this.reviewVoteRepository.findOne({
      where: { reviewId: id, userId },
    });

    if (existingVote) {
      if (existingVote.isHelpful) {
        return { message: 'Đã đánh dấu trước đó' };
      }
      existingVote.isHelpful = true;
      await this.reviewVoteRepository.save(existingVote);
    } else {
      const vote = this.reviewVoteRepository.create({
        reviewId: id,
        userId,
        isHelpful: true,
      });
      await this.reviewVoteRepository.save(vote);
    }

    await this.reviewRepository.increment({ id }, 'helpfulCount', 1);

    return { message: 'Đánh dấu hữu ích thành công' };
  }

  async removeVote(id: string, userId: string): Promise<{ message: string }> {
    const vote = await this.reviewVoteRepository.findOne({
      where: { reviewId: id, userId },
    });

    if (!vote || !vote.isHelpful) {
      return { message: 'Chưa đánh dấu hữu ích' };
    }

    await this.reviewVoteRepository.remove(vote);

    await this.reviewRepository.decrement({ id }, 'helpfulCount', 1);

    return { message: 'Bỏ đánh dấu hữu ích thành công' };
  }

  async report(id: string, userId: string, dto: { reason?: string }): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    if (review.userId === userId) {
      throw new BadRequestException('Không thể báo cáo review của chính mình');
    }

    const existingReport = await this.reviewVoteRepository.findOne({
      where: { reviewId: id, userId },
    });

    if (existingReport) {
      return { message: 'Đã báo cáo trước đó' };
    }

    await this.reviewRepository.increment({ id }, 'reportCount', 1);

    if (review.reportCount >= 2) {
      await this.reviewRepository.update(id, { isReported: true });
    }

    const vote = this.reviewVoteRepository.create({
      reviewId: id,
      userId,
      isHelpful: false,
    });
    await this.reviewVoteRepository.save(vote);

    return { message: 'Báo cáo thành công' };
  }

  async respondToReview(id: string, userId: string, response: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    const court = await this.courtRepository.findOne({ where: { id: review.courtId } });

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền phản hồi review này');
    }

    await this.reviewRepository.update(id, {
      adminResponse: response,
      respondedAt: new Date(),
    });

    return this.findOne(id);
  }

  async toggleFeature(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    await this.reviewRepository.update(id, { isFeatured: !review.isFeatured });

    return this.findOne(id);
  }

  async toggleVerify(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    await this.reviewRepository.update(id, { isVerified: !review.isVerified });

    return this.findOne(id);
  }

  private async updateCourtRating(courtId: string): Promise<void> {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.overallRating)', 'avgRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('review.courtId = :courtId', { courtId })
      .andWhere('review.isVerified = :isVerified', { isVerified: true })
      .getRawOne();

    await this.courtRepository.update(courtId, {
      avgRating: parseFloat(stats.avgRating) || 0,
      totalReviews: parseInt(stats.totalReviews) || 0,
    });
  }

  private mapToResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      bookingId: review.bookingId,
      userId: review.userId,
      user: review.user
        ? {
            id: review.user.id,
            fullName: review.user.fullName,
            avatarUrl: review.user.avatarUrl,
          }
        : undefined,
      courtId: review.courtId,
      overallRating: review.overallRating,
      courtRating: review.courtRating,
      serviceRating: review.serviceRating,
      locationRating: review.locationRating,
      priceRating: review.priceRating,
      title: review.title,
      content: review.content,
      images: review.images || [],
      helpfulCount: review.helpfulCount || 0,
      reportCount: review.reportCount || 0,
      isReported: review.isReported || false,
      isVerified: review.isVerified ?? true,
      isFeatured: review.isFeatured || false,
      adminResponse: review.adminResponse,
      respondedAt: review.respondedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
