import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1705000000000 implements MigrationInterface {
  name = 'InitialSchema1705000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // Create ENUM Types
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('pending', 'active', 'inactive', 'banned')
    `);
    await queryRunner.query(`
      CREATE TYPE "auth_provider_enum" AS ENUM ('email', 'google', 'facebook', 'apple')
    `);
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "court_status_enum" AS ENUM ('pending', 'active', 'inactive', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM (
        'pending_payment', 'pending_confirmation', 'confirmed',
        'checked_in', 'completed', 'cancelled', 'no_show', 'refunded'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM (
        'vnpay', 'momo', 'zalopay', 'bank_transfer', 'cash', 'wallet'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_type_enum" AS ENUM ('deposit', 'full', 'refund', 'topup')
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM (
        'pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "match_status_enum" AS ENUM (
        'open', 'full', 'in_progress', 'completed', 'cancelled', 'expired'
      )
    `);

    // ============================================
    // User Ranks (must come before users)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_ranks" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL,
        "slug" VARCHAR(50) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "min_matches" INT NOT NULL,
        "max_matches" INT,
        "color" VARCHAR(7),
        "benefits" JSONB DEFAULT '[]',
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // User Roles
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL UNIQUE,
        "slug" VARCHAR(50) UNIQUE NOT NULL,
        "description" TEXT,
        "permissions" JSONB DEFAULT '[]',
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Users
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255),
        "phone" VARCHAR(20) UNIQUE,
        "full_name" VARCHAR(100) NOT NULL,
        "avatar_url" TEXT,
        "date_of_birth" DATE,
        "gender" gender_enum,
        "bio" TEXT,
        "status" user_status_enum DEFAULT 'active',
        "email_verified" BOOLEAN DEFAULT FALSE,
        "phone_verified" BOOLEAN DEFAULT FALSE,
        "rank_id" INT REFERENCES user_ranks(id),
        "total_points" INT DEFAULT 0,
        "total_matches" INT DEFAULT 0,
        "total_bookings" INT DEFAULT 0,
        "auth_provider" auth_provider_enum DEFAULT 'email',
        "provider_id" VARCHAR(255),
        "follower_count" INT DEFAULT 0,
        "following_count" INT DEFAULT 0,
        "post_count" INT DEFAULT 0,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        "last_login_at" TIMESTAMPTZ
      )
    `);

    // ============================================
    // User Role Mappings
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "user_role_mappings" (
        "user_id" UUID REFERENCES users(id) ON DELETE CASCADE,
        "role_id" INT REFERENCES user_roles(id) ON DELETE CASCADE,
        "assigned_at" TIMESTAMPTZ DEFAULT NOW(),
        "assigned_by" UUID REFERENCES users(id),
        PRIMARY KEY (user_id, role_id)
      )
    `);

    // ============================================
    // Sports
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "sports" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "description" TEXT,
        "court_count" INT DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Amenities
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "amenities" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "icon_url" TEXT,
        "category" VARCHAR(50),
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Courts
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "courts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" UUID NOT NULL REFERENCES users(id),
        "name" VARCHAR(200) NOT NULL,
        "slug" VARCHAR(200) UNIQUE NOT NULL,
        "description" TEXT,
        "address" TEXT NOT NULL,
        "province" VARCHAR(100),
        "district" VARCHAR(100),
        "ward" VARCHAR(100),
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "phone" VARCHAR(20),
        "email" VARCHAR(255),
        "website" TEXT,
        "facebook_url" TEXT,
        "base_price" DECIMAL(12, 0) NOT NULL,
        "price_unit" VARCHAR(10) DEFAULT 'hour',
        "weekend_price" DECIMAL(12, 0),
        "peak_hour_price" DECIMAL(12, 0),
        "open_time" VARCHAR(10) DEFAULT '06:00',
        "close_time" VARCHAR(10) DEFAULT '22:00',
        "slot_duration" INT DEFAULT 60,
        "avg_rating" DECIMAL(3, 2) DEFAULT 0,
        "total_reviews" INT DEFAULT 0,
        "total_bookings" INT DEFAULT 0,
        "total_revenue" DECIMAL(15, 0) DEFAULT 0,
        "cover_image_url" TEXT,
        "status" court_status_enum DEFAULT 'pending',
        "is_featured" BOOLEAN DEFAULT FALSE,
        "is_verified" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Court Sports (Junction Table)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_sports" (
        "court_id" UUID REFERENCES courts(id) ON DELETE CASCADE,
        "sport_id" INT REFERENCES sports(id) ON DELETE CASCADE,
        "price" DECIMAL(12, 0),
        "is_primary" BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (court_id, sport_id)
      )
    `);

    // ============================================
    // Court Amenities (Junction Table)
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_amenities" (
        "court_id" UUID REFERENCES courts(id) ON DELETE CASCADE,
        "amenity_id" INT REFERENCES amenities(id) ON DELETE CASCADE,
        PRIMARY KEY (court_id, amenity_id)
      )
    `);

    // ============================================
    // Court Images
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "court_images" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "court_id" UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
        "url" TEXT NOT NULL,
        "caption" VARCHAR(255),
        "type" VARCHAR(20) DEFAULT 'gallery',
        "sort_order" INT DEFAULT 0,
        "is_verified" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Bookings
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_code" VARCHAR(20) UNIQUE NOT NULL,
        "user_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID NOT NULL REFERENCES courts(id),
        "sport_id" INT REFERENCES sports(id),
        "owner_id" UUID NOT NULL,
        "booking_date" DATE NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME NOT NULL,
        "duration_minutes" INT NOT NULL,
        "base_price" DECIMAL(12, 0) NOT NULL,
        "discount_amount" DECIMAL(12, 0) DEFAULT 0,
        "final_price" DECIMAL(12, 0) NOT NULL,
        "deposit_amount" DECIMAL(12, 0) DEFAULT 0,
        "deposit_paid" BOOLEAN DEFAULT FALSE,
        "total_paid" DECIMAL(12, 0) DEFAULT 0,
        "status" booking_status_enum DEFAULT 'pending_payment',
        "qr_code" TEXT UNIQUE,
        "qr_verified_at" TIMESTAMPTZ,
        "qr_verified_by" UUID REFERENCES users(id),
        "player_name" VARCHAR(100),
        "player_phone" VARCHAR(20),
        "player_count" INT DEFAULT 1,
        "notes" TEXT,
        "cancellation_reason" TEXT,
        "cancelled_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Booking Payments
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "booking_payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        "amount" DECIMAL(12, 0) NOT NULL,
        "payment_method" payment_method_enum,
        "payment_type" payment_type_enum DEFAULT 'deposit',
        "gateway_txn_id" VARCHAR(100),
        "gateway_data" JSONB,
        "status" payment_status_enum DEFAULT 'pending',
        "refund_amount" DECIMAL(12, 0),
        "refund_reason" TEXT,
        "refunded_at" TIMESTAMPTZ,
        "refunded_by" UUID REFERENCES users(id),
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Reviews
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" UUID UNIQUE NOT NULL REFERENCES bookings(id),
        "user_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID NOT NULL REFERENCES courts(id),
        "overall_rating" INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
        "court_rating" INT CHECK (court_rating BETWEEN 1 AND 5),
        "service_rating" INT CHECK (service_rating BETWEEN 1 AND 5),
        "location_rating" INT CHECK (location_rating BETWEEN 1 AND 5),
        "price_rating" INT CHECK (price_rating BETWEEN 1 AND 5),
        "title" VARCHAR(200),
        "content" TEXT,
        "images" JSONB DEFAULT '[]',
        "helpful_count" INT DEFAULT 0,
        "report_count" INT DEFAULT 0,
        "is_reported" BOOLEAN DEFAULT FALSE,
        "is_verified" BOOLEAN DEFAULT TRUE,
        "is_featured" BOOLEAN DEFAULT FALSE,
        "admin_response" TEXT,
        "responded_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Review Votes
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "review_votes" (
        "review_id" UUID REFERENCES reviews(id) ON DELETE CASCADE,
        "user_id" UUID REFERENCES users(id) ON DELETE CASCADE,
        "is_helpful" BOOLEAN NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (review_id, user_id)
      )
    `);

    // ============================================
    // Matches
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "creator_id" UUID NOT NULL REFERENCES users(id),
        "court_id" UUID REFERENCES courts(id),
        "sport_id" INT NOT NULL REFERENCES sports(id),
        "title" VARCHAR(200),
        "description" TEXT,
        "max_players" INT NOT NULL,
        "min_players" INT DEFAULT 1,
        "current_players" INT DEFAULT 1,
        "skill_level" VARCHAR(20) DEFAULT 'all',
        "gender_restrict" VARCHAR(20) DEFAULT 'all',
        "age_min" INT,
        "age_max" INT,
        "match_date" DATE NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME,
        "duration_hours" DECIMAL(4, 2) DEFAULT 1.5,
        "location_name" VARCHAR(255),
        "latitude" DECIMAL(10, 8),
        "longitude" DECIMAL(11, 8),
        "location_address" TEXT,
        "cost_per_person" DECIMAL(12, 0),
        "cost_includes" TEXT[],
        "is_free" BOOLEAN DEFAULT FALSE,
        "total_collected" DECIMAL(12, 0) DEFAULT 0,
        "status" match_status_enum DEFAULT 'open',
        "has_chat" BOOLEAN DEFAULT TRUE,
        "allow_join_request" BOOLEAN DEFAULT TRUE,
        "auto_accept" BOOLEAN DEFAULT FALSE,
        "view_count" INT DEFAULT 0,
        "join_count" INT DEFAULT 0,
        "expire_after_hours" INT DEFAULT 72,
        "expires_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Match Players
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "match_players" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        "user_id" UUID NOT NULL REFERENCES users(id),
        "role" VARCHAR(20) DEFAULT 'accepted',
        "payment_status" VARCHAR(20) DEFAULT 'pending',
        "amount_paid" DECIMAL(12, 0),
        "checked_in" BOOLEAN DEFAULT FALSE,
        "checked_in_at" TIMESTAMPTZ,
        "note" VARCHAR(255),
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(match_id, user_id)
      )
    `);

    // ============================================
    // Match Messages
    // ============================================
    await queryRunner.query(`
      CREATE TABLE "match_messages" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        "sender_id" UUID NOT NULL REFERENCES users(id),
        "message_type" VARCHAR(20) DEFAULT 'text',
        "content" TEXT NOT NULL,
        "is_deleted" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ============================================
    // Indexes
    // ============================================
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_phone" ON "users"("phone")`);
    await queryRunner.query(`CREATE INDEX "idx_users_status" ON "users"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_users_rank" ON "users"("rank_id")`);
    await queryRunner.query(`CREATE INDEX "idx_courts_owner" ON "courts"("owner_id")`);
    await queryRunner.query(`CREATE INDEX "idx_courts_status" ON "courts"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_user" ON "bookings"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_court" ON "bookings"("court_id")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_date" ON "bookings"("booking_date")`);
    await queryRunner.query(`CREATE INDEX "idx_bookings_status" ON "bookings"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_reviews_court" ON "reviews"("court_id")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_sport" ON "matches"("sport_id")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_date" ON "matches"("match_date")`);
    await queryRunner.query(`CREATE INDEX "idx_matches_status" ON "matches"("status")`);

    // ============================================
    // Seed Data - User Ranks
    // ============================================
    await queryRunner.query(`
      INSERT INTO "user_ranks" (name, slug, min_matches, max_matches, color, benefits) VALUES
      ('Tân binh', 'rookie', 0, 5, '#9CA3AF', '[]'),
      ('Nghiệp dư', 'amateur', 6, 20, '#22C55E', '["discount_3"]'),
      ('Chuyên nghiệp', 'pro', 21, 50, '#3B82F6', '["discount_5", "priority_booking"]'),
      ('Cao thủ', 'expert', 51, 100, '#F59E0B', '["discount_7", "priority_booking"]'),
      ('Huyền thoại', 'legend', 101, NULL, '#EF4444', '["discount_10", "priority_booking", "free_ranking", "vip_support"]')
    `);

    // ============================================
    // Seed Data - User Roles
    // ============================================
    await queryRunner.query(`
      INSERT INTO "user_roles" (name, slug, permissions) VALUES
      ('Player', 'player', '["book:create", "review:create", "match:create"]'),
      ('Court Owner', 'court_owner', '["court:manage", "booking:view", "stats:view"]'),
      ('Admin', 'admin', '["user:manage", "court:approve", "content:moderate"]'),
      ('Super Admin', 'super_admin', '["*:all"]')
    `);

    // ============================================
    // Seed Data - Sports
    // ============================================
    await queryRunner.query(`
      INSERT INTO "sports" (name, slug, icon_url, description) VALUES
      ('Bóng đá 5', 'football-5', '/icons/football-5.png', 'Sân bóng đá 5 người'),
      ('Bóng đá 7', 'football-7', '/icons/football-7.png', 'Sân bóng đá 7 người'),
      ('Cầu lông', 'badminton', '/icons/badminton.png', 'Sân cầu lông'),
      ('Tennis', 'tennis', '/icons/tennis.png', 'Sân tennis'),
      ('Bóng rổ', 'basketball', '/icons/basketball.png', 'Sân bóng rổ'),
      ('Pickleball', 'pickleball', '/icons/pickleball.png', 'Sân pickleball'),
      ('Bóng chuyền', 'volleyball', '/icons/volleyball.png', 'Sân bóng chuyền')
    `);

    // ============================================
    // Seed Data - Amenities
    // ============================================
    await queryRunner.query(`
      INSERT INTO "amenities" (name, slug, category) VALUES
      ('Máy lạnh', 'air_conditioner', 'facility'),
      ('WiFi miễn phí', 'wifi_free', 'facility'),
      ('Chỗ để xe', 'parking', 'facility'),
      ('Phòng thay đồ', 'changing_room', 'facility'),
      ('Nước uống miễn phí', 'water_free', 'service'),
      ('Thuê vợt', 'racket_rental', 'equipment'),
      ('Cafe', 'cafe', 'service')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "match_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "match_players"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "review_votes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "court_sports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "amenities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_role_mappings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_ranks"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "match_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "court_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
  }
}
