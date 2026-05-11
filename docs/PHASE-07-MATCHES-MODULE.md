# Phase 7: Matches Module (Lên Kèo)

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Module Structure](#module-structure)
4. [API Endpoints](#api-endpoints)
5. [Business Rules](#business-rules)
6. [WebSocket Gateway](#websocket-gateway)

---

## Tổng Quan

Module Matches cho phép người dùng tạo và tham gia các trận đấu/Lên kèo. Hỗ trợ:

- Tạo trận đấu với thông tin chi tiết (thời gian, địa điểm, chi phí)
- Thiết lập điều kiện tham gia (trình độ, giới tính, độ tuổi)
- Phê duyệt/từ chối yêu cầu tham gia
- Chat trong trận đấu
- Check-in người chơi
- Real-time notifications qua WebSocket

---

## Database Schema

### Matches Table

```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    court_id UUID,
    sport_id INT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    max_players INT NOT NULL,
    min_players INT DEFAULT 1,
    current_players INT DEFAULT 1,
    skill_level VARCHAR(20) DEFAULT 'all',
    gender_restrict VARCHAR(20) DEFAULT 'all',
    age_min INT,
    age_max INT,
    match_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration_hours DECIMAL(4,2) DEFAULT 1.5,
    location_name VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_address TEXT,
    cost_per_person DECIMAL(12,0),
    cost_includes TEXT[],
    is_free BOOLEAN DEFAULT false,
    total_collected DECIMAL(12,0) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open',
    has_chat BOOLEAN DEFAULT true,
    allow_join_request BOOLEAN DEFAULT true,
    auto_accept BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    join_count INT DEFAULT 0,
    expire_after_hours INT DEFAULT 72,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Match Players Table

```sql
CREATE TABLE match_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'accepted',
    payment_status VARCHAR(20) DEFAULT 'pending',
    amount_paid DECIMAL(12,0),
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    note VARCHAR(255),
    PRIMARY KEY (match_id, user_id)
);
```

### Match Messages Table

```sql
CREATE TABLE match_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Module Structure

```
src/modules/matches/
├── dto/
│   ├── index.ts
│   └── matches.dto.ts
├── index.ts
├── match.gateway.ts
├── matches.controller.ts
├── matches.module.ts
└── matches.service.ts
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches` | Danh sách trận đấu |
| GET | `/matches/:id` | Chi tiết trận đấu |
| GET | `/matches/:id/players` | Danh sách người chơi |

### Protected Endpoints (Cần auth)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/matches` | Tạo trận đấu mới | USER |
| GET | `/matches/my-matches` | Trận đấu của tôi | USER |
| GET | `/matches/my-created` | Trận đấu tôi tạo | USER |
| GET | `/matches/summary` | Thống kê trận đấu | USER |
| PUT | `/matches/:id` | Cập nhật trận đấu | CREATOR |
| POST | `/matches/:id/join` | Tham gia trận đấu | USER |
| DELETE | `/matches/:id/leave` | Rời khỏi trận đấu | USER |
| POST | `/matches/:id/respond/:playerId` | Phê duyệt/từ chối | CREATOR |
| POST | `/matches/:id/cancel` | Hủy trận đấu | CREATOR |
| POST | `/matches/:id/start` | Bắt đầu trận đấu | CREATOR |
| POST | `/matches/:id/complete` | Kết thúc trận đấu | CREATOR |
| POST | `/matches/:id/checkin/:playerId` | Check-in người chơi | CREATOR |
| GET | `/matches/:id/messages` | Tin nhắn chat | USER |
| POST | `/matches/:id/messages` | Gửi tin nhắn | USER |
| DELETE | `/matches/:id/messages/:messageId` | Xóa tin nhắn | USER |

---

## Business Rules

### 1. Tạo Trận Đấu

**Điều kiện:**
- User phải đăng nhập
- Sport phải tồn tại
- Court (nếu có) phải tồn tại

**Mặc định:**
- `status = 'open'`
- `currentPlayers = 1` (người tạo)
- Người tạo được thêm vào danh sách player với role = 'creator'

### 2. Tham Gia Trận Đấu

**Điều kiện:**
- Trận đấu phải ở trạng thái `open` hoặc `full`
- Chưa hết hạn (`expiresAt > now`)
- Chưa tham gia
- Chưa đầy (`currentPlayers < maxPlayers`)

**Auto Accept:**
- Nếu `autoAccept = true`: Tự động chấp nhận và tăng `currentPlayers`
- Nếu `autoAccept = false`: Tạo player với role = 'pending'

### 3. Trạng Thái Trận Đấu

```
OPEN → FULL → IN_PROGRESS → COMPLETED
  ↓        ↓
CANCELLED  CANCELLED
  ↓
EXPIRED
```

| Status | Mô tả |
|--------|-------|
| `open` | Đang mở, có thể tham gia |
| `full` | Đã đầy người |
| `in_progress` | Đang diễn ra |
| `completed` | Đã kết thúc |
| `cancelled` | Đã hủy |
| `expired` | Đã hết hạn |

### 4. Quyền Hạn

| Action | Ai được phép |
|--------|--------------|
| Cập nhật | Chỉ creator |
| Hủy | Chỉ creator |
| Bắt đầu | Chỉ creator |
| Check-in | Chỉ creator |
| Phê duyệt tham gia | Chỉ creator |

---

## WebSocket Gateway

### Namespace: `/matches`

### Authentication

Client cần gửi token qua:
- `socket.handshake.auth.token`
- `socket.handshake.headers.authorization`

### Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_match` | `{ matchId: string }` | Tham gia room chat |
| `leave_match` | `{ matchId: string }` | Rời room chat |
| `send_message` | `{ matchId, content, messageType? }` | Gửi tin nhắn |
| `typing_start` | `{ matchId: string }` | Bắt đầu typing |
| `typing_stop` | `{ matchId: string }` | Dừng typing |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ id, matchId, senderId, content, ... }` | Tin nhắn mới |
| `user_joined` | `{ matchId, userId, userName }` | User tham gia room |
| `user_left` | `{ matchId, userId, userName }` | User rời room |
| `user_typing` | `{ matchId, userId, isTyping }` | Typing indicator |
| `match_updated` | `{ match }` | Cập nhật trận đấu |
| `player_joined` | `{ player }` | Người chơi mới |
| `player_left` | `{ playerId }` | Người chơi rời đi |

### Ví dụ Sử Dụng

```javascript
const socket = io('http://localhost:3000/matches', {
  auth: { token: 'Bearer ' + token }
});

socket.on('connect', () => {
  socket.emit('join_match', { matchId: 'uuid-của-trận' });
});

socket.on('new_message', (message) => {
  console.log('Tin nhắn mới:', message);
});

socket.emit('send_message', {
  matchId: 'uuid-của-trận',
  content: 'Xin chào mọi người!'
});
```

---

## Next Steps

➡️ **Phase 8: Payments Module** - Tích hợp thanh toán VNPay

➡️ **Phase 9: Notifications Module** - Gửi thông báo cho users

---

**Version:** 1.0
**Last Updated:** 2026-05-11
