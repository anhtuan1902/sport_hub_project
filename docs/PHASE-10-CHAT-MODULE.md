# Phase 10: Chat Module (Nhắn Tin)

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Module Structure](#module-structure)
4. [API Endpoints](#api-endpoints)
5. [WebSocket Gateway](#websocket-gateway)
6. [Business Rules](#business-rules)

---

## Tổng Quan

### Mục tiêu Phase 10

Module Chat cho phép người dùng và chủ sân có thể nhắn tin trực tiếp với nhau:

- **User → Owner**: Người dùng hỏi thông tin sân, đặt sân
- **Owner → User**: Chủ sân phản hồi, gửi thông báo
- **User → User**: Người dùng chat với nhau (trong tương lai)

### Use Cases

1. **Hỏi về sân**: User nhắn tin cho chủ sân để hỏi giá, tình trạng sân
2. **Xác nhận đặt sân**: Owner phản hồi về việc đặt sân
3. **Thông báo**: Owner gửi tin nhắn cho tất cả người đã đặt sân
4. **Hỗ trợ**: Giải đáp thắc mắc về dịch vụ

### Timeline

**Ước tính:** 90-120 phút

---

## Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL DEFAULT 'direct',
    court_id UUID,
    title VARCHAR(255),
    is_group BOOLEAN DEFAULT false,
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_court FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_court ON conversations(court_id);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
```

### Conversation Participants Table

```sql
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(30) DEFAULT 'member',
    nickname VARCHAR(100),
    last_read_message_id UUID,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
```

### Messages Table

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB,
    reply_to_id UUID,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reply_to FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

---

## Enums

### ConversationType

```typescript
export enum ConversationType {
  DIRECT = 'direct',           // Chat 1-1
  COURT_INQUIRY = 'court_inquiry', // Hỏi về sân
  BOOKING = 'booking',         // Chat liên quan đặt sân
  ANNOUNCEMENT = 'announcement'  // Thông báo từ chủ sân
}
```

### MessageType

```typescript
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  LOCATION = 'location',
  SYSTEM = 'system'
}
```

### ParticipantRole

```typescript
export enum ParticipantRole {
  OWNER = 'owner',       // Người tạo cuộc trò chuyện
  ADMIN = 'admin',       // Quản trị viên
  MEMBER = 'member'      // Thành viên
}
```

---

## Module Structure

```
src/modules/chat/
├── dto/
│   ├── index.ts
│   ├── create-conversation.dto.ts
│   ├── send-message.dto.ts
│   ├── update-conversation.dto.ts
│   └── conversation-query.dto.ts
├── entities/
│   ├── conversation.entity.ts
│   ├── conversation-participant.entity.ts
│   └── message.entity.ts
├── enums/
│   └── index.ts
├── chat.controller.ts
├── chat.gateway.ts
├── chat.module.ts
├── chat.service.ts
└── index.ts
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/health` | Health check |

### Protected Endpoints (Cần auth)

#### Conversations

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/chat/conversations` | Tạo cuộc trò chuyện mới | USER, OWNER |
| GET | `/chat/conversations` | Danh sách cuộc trò chuyện | USER, OWNER |
| GET | `/chat/conversations/:id` | Chi tiết cuộc trò chuyện | USER, OWNER |
| PUT | `/chat/conversations/:id` | Cập nhật cuộc trò chuyện | USER, OWNER |
| DELETE | `/chat/conversations/:id` | Xóa/Rời cuộc trò chuyện | USER, OWNER |
| POST | `/chat/conversations/:id/participants` | Thêm người tham gia | USER, OWNER |
| DELETE | `/chat/conversations/:id/participants/:userId` | Xóa người tham gia | USER, OWNER |
| PUT | `/chat/conversations/:id/read` | Đánh dấu đã đọc | USER, OWNER |
| POST | `/chat/conversations/:id/mute` | Bật/tắt thông báo | USER, OWNER |
| POST | `/chat/conversations/:id/pin` | Ghim/bỏ ghim | USER, OWNER |

#### Messages

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/chat/conversations/:id/messages` | Danh sách tin nhắn | USER, OWNER |
| POST | `/chat/conversations/:id/messages` | Gửi tin nhắn | USER, OWNER |
| PUT | `/chat/messages/:id` | Chỉnh sửa tin nhắn | USER, OWNER |
| DELETE | `/chat/messages/:id` | Xóa tin nhắn | USER, OWNER |

#### Court Chat (Owner only)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/chat/courts/:courtId/conversations` | DS cuộc trò chuyện về sân | OWNER |
| POST | `/chat/courts/:courtId/broadcast` | Gửi thông báo cho tất cả | OWNER |

#### Statistics

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/chat/unread-count` | Số tin nhắn chưa đọc | USER, OWNER |

---

## WebSocket Gateway

### Namespace: `/chat`

### Authentication

Client cần gửi token qua:
- `socket.handshake.auth.token`
- `socket.handshake.headers.authorization`

### Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId: string }` | Tham gia room chat |
| `leave_conversation` | `{ conversationId: string }` | Rời room chat |
| `send_message` | `{ conversationId, content, messageType?, metadata?, replyToId? }` | Gửi tin nhắn |
| `typing_start` | `{ conversationId: string }` | Bắt đầu typing |
| `typing_stop` | `{ conversationId: string }` | Dừng typing |
| `mark_read` | `{ conversationId: string, messageId: string }` | Đánh dấu đã đọc |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ id, conversationId, sender, content, ... }` | Tin nhắn mới |
| `message_edited` | `{ messageId, content, updatedAt }` | Tin nhắn đã sửa |
| `message_deleted` | `{ messageId }` | Tin nhắn đã xóa |
| `user_joined` | `{ conversationId, user }` | User tham gia |
| `user_left` | `{ conversationId, userId }` | User rời đi |
| `user_typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `conversation_updated` | `{ conversation }` | Cập nhật cuộc trò chuyện |
| `message_read` | `{ conversationId, userId, messageId }` | Tin nhắn đã đọc |
| `unread_count` | `{ count: number }` | Số tin chưa đọc |

### Kết nối WebSocket

```javascript
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'Bearer ' + token }
});

socket.on('connect', () => {
  console.log('Connected to chat');
});

socket.on('new_message', (message) => {
  console.log('Tin nhắn mới:', message);
});

socket.emit('send_message', {
  conversationId: 'uuid-cuộc-trò-chuyện',
  content: 'Xin chào!'
});
```

---

## Business Rules

### 1. Tạo Cuộc Trò Chuyện

**Điều kiện:**
- User phải đăng nhập
- Nếu type = 'court_inquiry': Court phải tồn tại

**Tự động:**
- Người tạo được thêm vào participants với role = 'owner'
- Nếu type = 'court_inquiry': Chủ sân được tự động thêm vào

### 2. Gửi Tin Nhắn

**Điều kiện:**
- User phải là participant của cuộc trò chuyện
- Cuộc trò chuyện không bị xóa

**Tự động:**
- Cập nhật `lastMessageId` và `lastMessageAt` của conversation
- Gửi notification cho các participant khác (nếu không muted)

### 3. Quyền Hạn

| Action | Ai được phép |
|--------|--------------|
| Tạo conversation | User, Owner |
| Thêm participant | Owner của cuộc trò chuyện |
| Xóa participant | Owner, Admin |
| Gửi tin nhắn | Tất cả participant |
| Xóa tin nhắn | Người gửi, Owner |
| Cập nhật conversation | Owner, Admin |

### 4. Unread Count

- Đếm số tin nhắn có `createdAt > lastReadAt`
- Trả về tổng số và số lượng theo conversation

### 5. Real-time Updates

- Khi user online: Gửi tin nhắn qua WebSocket
- Khi user offline: Tạo notification trong Notification Module

---

## Next Steps

➡️ **Phase 11: Notifications Module** - Gửi thông báo real-time

➡️ **Frontend Integration** - Kết nối UI với Chat Module

---

**Version:** 1.0
**Last Updated:** 2026-05-11
