# Sport Hub Project

> Ứng dụng thể thao kết nối: Chủ sân - Người chơi - Cộng đồng

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Tài Liệu](#tài-liệu)
3. [Công Nghệ](#công-nghệ)
4. [Bắt Đầu](#bắt-đầu)
5. [Liên Hệ](#liên-hệ)

---

## Tổng Quan

**Sport Hub** là một ứng dụng thể thao toàn diện với các tính năng:

### Core Features

- **Đặt Sân** - Tìm và đặt sân thể thao dễ dàng
- **Quản Lý Sân** - Cho chủ sân quản lý lịch đặt, doanh thu
- **Lên Kèo** - Tạo và tham gia các trận đấu
- **Thanh Toán** - Tích hợp VNPay, MoMo
- **Đánh Giá** - Review và đánh giá sân
- **Xã Hội** - Blog, feed, kết nối cộng đồng

### Đối Tượng Người Dùng

| Vai trò | Mô tả |
|---------|--------|
| **Người chơi** | Tìm sân, đặt sân, lên kèo, giao lưu |
| **Chủ sân** | Quản lý sân, lịch đặt, doanh thu |
| **Admin** | Quản lý hệ thống, users, nội dung |

---

## Tài Liệu

### 📚 Hướng Dẫn Setup

| Document | Mô tả |
|----------|--------|
| [📗 Setup Guide](01-SETUP-GUIDE.md) | Hướng dẫn khởi tạo project từ đầu |
| [📘 Libraries](02-LIBRARIES.md) | Danh sách thư viện sử dụng |

### 📊 Database Design

| Document | Mô tả |
|----------|--------|
| [📙 Database Schema](03-DATABASE-SCHEMA.md) | Thiết kế database chi tiết |

### 🔌 API Documentation

| Document | Mô tả |
|----------|--------|
| [📕 API Reference](04-API-REFERENCE.md) | REST API endpoints |

### 📱 Module Documentation

| Document | Mô tả |
|----------|--------|
| [📗 PHASE-05](docs/PHASE-05-BOOKING-MODULE.md) | Booking Module |
| [📘 PHASE-06](docs/PHASE-06-REVIEWS-MODULE.md) | Reviews Module |
| [📙 PHASE-07](docs/PHASE-07-MATCHES-MODULE.md) | Matches Module (Lên Kèo) |
| [📕 PHASE-08](docs/PHASE-08-PAYMENTS-MODULE.md) | Payments Module (VNPay) |
| [📔 PHASE-09](docs/PHASE-09-NOTIFICATIONS-MODULE.md) | Notifications & Real-time |

---

## Công Nghệ

### Backend

| Công nghệ | Version | Mục đích |
|-----------|---------|-----------|
| Node.js | >= 20.0 | Runtime |
| NestJS | ^10.3 | Framework |
| TypeORM | ^0.3 | ORM |
| PostgreSQL | 15+ | Database |
| Redis | 7+ | Cache |
| JWT | - | Authentication |

### Frontend (Mobile)

| Công nghệ | Version | Mục đích |
|-----------|---------|-----------|
| React Native | - | Mobile framework |
| Expo | ~51 | Development |
| Tailwind/NativeWind | - | Styling |
| Zustand | ^4.5 | State management |
| TanStack Query | ^5.28 | Data fetching |

### Infrastructure

| Công nghệ | Mục đích |
|-----------|----------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| AWS S3 | File storage |
| Firebase | Push notifications |

---

## Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├──────────────────┬──────────────────┬──────────────────────────┤
│    Mobile App     │   Admin Web      │   Partner Portal         │
│  (React Native)   │  (Next.js)       │   (React)               │
└────────┬─────────┴────────┬─────────┴────────────┬─────────────┘
         │                 │                      │
         └─────────────────┼──────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│                   (Kong / Nginx)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌───────────────┐ ┌────────────────┐
│   Auth API     │ │   Courts API  │ │  Bookings API  │
│   (NestJS)     │ │   (NestJS)    │ │   (NestJS)      │
└────────┬───────┘ └───────┬───────┘ └───────┬────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
         ┌─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌───────────────┐ ┌────────────────┐
│  PostgreSQL    │ │    Redis     │ │  AWS S3        │
│  (Database)    │ │  (Cache)     │ │  (Files)       │
└────────────────┘ └───────────────┘ └────────────────┘
```

---

## Bắt Đầu

### Yêu Cầu

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker Desktop
- PostgreSQL 15+
- Redis 7+

### Cài Đặt

```bash
# 1. Clone repository
git clone <repo-url>
cd sport-hub

# 2. Cài dependencies
npm install

# 3. Setup Docker
cd infrastructure/docker
docker-compose up -d

# 4. Setup Backend
cd apps/api
npm install
npm run start:dev

# 5. Build Shared Package
cd packages/shared
npm run build
```

### Kiểm Tra

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/docs

---

## Cấu Trúc Project

```
sport-hub/
├── apps/
│   ├── api/                    # Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── modules/       # Feature modules
│   │   │   │   ├── auth/      # Authentication
│   │   │   │   ├── users/     # User management
│   │   │   │   ├── courts/    # Court management
│   │   │   │   ├── bookings/  # Booking system
│   │   │   │   ├── matches/   # Match/Lên kèo
│   │   │   │   └── ...
│   │   │   ├── common/        # Shared utilities
│   │   │   └── config/       # Configuration
│   │   └── test/
│   │
│   └── mobile/                # Mobile App (React Native)
│       └── app/               # Expo Router pages
│
├── packages/
│   └── shared/                # Shared types & constants
│       ├── src/
│       │   ├── types/         # TypeScript types
│       │   ├── constants/     # App constants
│       │   └── utils/         # Shared utilities
│       └── dist/              # Compiled output
│
├── infrastructure/
│   └── docker/                # Docker configurations
│
├── docs/                      # Documentation
│
├── turbo.json                 # Turborepo config
└── package.json               # Root package.json
```

---

## Roadmap

### ✅ Phase 1-6: MVP Complete (2026-05-11)
- [x] Project setup
- [x] User authentication (JWT, roles)
- [x] Court CRUD
- [x] Amenities & Sports
- [x] Booking system
- [x] Reviews & ratings

### ✅ Phase 7-9: Advanced Features (2026-05-11)
- [x] Match/Lên kèo (create, join, chat)
- [x] Payments (VNPay integration)
- [x] Notifications (real-time WebSocket)

### 🚧 Phase 10: Social Features
- [ ] Blog posts
- [ ] User followers
- [ ] Activity feed

### 📋 Future Enhancements
- [ ] Gamification (badges, points)
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Email/SMS notifications

---

## Liên Hệ

- **Email:** dev@sporthub.com
- **GitHub:** https://github.com/sport-hub
- **Discord:** Discord link

---

## Giấy Phép

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-09
