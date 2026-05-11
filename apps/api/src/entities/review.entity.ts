import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
@Index('idx_reviews_court', ['courtId'])
@Index('idx_reviews_user', ['userId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'booking_id', unique: true })
  bookingId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'court_id' })
  courtId: string;

  @Column({ type: 'int', name: 'overall_rating' })
  overallRating: number;

  @Column({ type: 'int', nullable: true, name: 'court_rating' })
  courtRating: number;

  @Column({ type: 'int', nullable: true, name: 'service_rating' })
  serviceRating: number;

  @Column({ type: 'int', nullable: true, name: 'location_rating' })
  locationRating: number;

  @Column({ type: 'int', nullable: true, name: 'price_rating' })
  priceRating: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', default: '[]' })
  images: any;

  @Column({ type: 'int', name: 'helpful_count', default: 0 })
  helpfulCount: number;

  @Column({ type: 'int', name: 'report_count', default: 0 })
  reportCount: number;

  @Column({ type: 'boolean', name: 'is_reported', default: false })
  isReported: boolean;

  @Column({ type: 'boolean', name: 'is_verified', default: true })
  isVerified: boolean;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'text', nullable: true, name: 'admin_response' })
  adminResponse: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'responded_at' })
  respondedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('review_votes')
export class ReviewVote {
  @PrimaryColumn({ type: 'uuid', name: 'review_id' })
  reviewId: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'boolean', name: 'is_helpful' })
  isHelpful: boolean;
}
