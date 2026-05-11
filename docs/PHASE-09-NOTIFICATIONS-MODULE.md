# Phase 9: Notifications & Real-time

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Database Schema](#database-schema)
3. [Module Structure](#module-structure)
4. [API Endpoints](#api-endpoints)
5. [WebSocket Gateway](#websocket-gateway)
6. [Notification Types](#notification-types)

---

## Tổng Quan

Module Notifications cung cấp hệ thống thông báo cho ứng dụng, bao gồm:

- Thông báo trong ứng dụng (in-app)
- Real-time notifications qua WebSocket
- Hỗ trợ nhiều loại thông báo (booking, match, payment, etc.)
- Đánh dấu đã đọc/chưa đọc

---

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    image_url VARCHAR(500),
    action_url VARCHAR(500),
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    channels VARCHAR(50)[] DEFAULT '{in_app}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## Module Structure

```
src/modules/notifications/
├── dto/
│   ├── index.ts
│   └── notifications.dto.ts
├── index.ts
├── notification.gateway.ts
├── notifications.controller.ts
├── notifications.module.ts
└── notifications.service.ts
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Danh sách thông báo | User |
| GET | `/notifications/unread-count` | Số thông báo chưa đọc | User |
| GET | `/notifications/:id` | Chi tiết thông báo | User |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc | User |
| PUT | `/notifications/read-all` | Đánh dấu tất cả đã đọc | User |
| DELETE | `/notifications/:id` | Xóa thông báo | User |
| DELETE | `/notifications` | Xóa tất cả thông báo | User |
| POST | `/notifications/device-token` | Đăng ký device token | User |

---

## WebSocket Gateway

### Namespace: `/notifications`

### Authentication

Client cần gửi JWT token qua:
- `socket.handshake.auth.token`
- `socket.handshake.headers.authorization`

### Connection Flow

```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'Bearer ' + jwtToken }
});

socket.on('connect', () => {
  console.log('Connected to notifications');
  // Server sẽ gửi unread count
});

socket.on('unread_count', (data) => {
  console.log('Unread count:', data.count);
});

socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
});
```

### Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `mark_read` | `{ notificationId: string }` | Đánh dấu đã đọc |
| `mark_all_read` | `{}` | Đánh dấu tất cả đã đọc |
| `request_unread_count` | `{}` | Yêu cầu số thông báo chưa đọc |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_notification` | `{ notification object }` | Thông báo mới |
| `notification_read` | `{ notificationId }` | Thông báo đã đọc |
| `unread_count` | `{ count: number }` | Số thông báo chưa đọc |

---

## Notification Types

### Type Enum

```typescript
enum NotificationType {
  BOOKING = 'booking',      // Thông báo đặt sân
  MATCH = 'match',          // Thông báo trận đấu
  PAYMENT = 'payment',      // Thông báo thanh toán
  REVIEW = 'review',        // Thông báo đánh giá
  SYSTEM = 'system',        // Thông báo hệ thống
  CHAT = 'chat',            // Thông báo chat
  PROMOTION = 'promotion',  // Thông báo khuyến mãi
}
```

### Channel Enum

```typescript
enum NotificationChannel {
  IN_APP = 'in_app',   // Thông báo trong ứng dụng
  EMAIL = 'email',     // Gửi qua email
  PUSH = 'push',       // Push notification
  SMS = 'sms',         // Tin nhắn SMS
}
```

### Pre-built Notification Methods

```typescript
// Thông báo đặt sân
await notificationsService.sendBookingConfirmation(userId, booking);
await notificationsService.sendBookingReminder(userId, booking);

// Thông báo trận đấu
await notificationsService.sendMatchInvite(userId, match, inviterName);
await notificationsService.sendMatchUpdate(userId, match, message);

// Thông báo thanh toán
await notificationsService.sendPaymentSuccess(userId, payment);
```

### Manual Notification Creation

```typescript
await notificationsService.create({
  userId: 'user-uuid',
  type: NotificationType.BOOKING,
  title: 'Xác nhận đặt sân',
  message: 'Bạn đã đặt sân thành công',
  actionUrl: '/bookings/123',
  data: { bookingId: '123' },
  channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
});
```

---

## Sending Notifications from Other Services

### Using Event Emitter

```typescript
// Trong một service khác
@Injectable()
export class BookingsService {
  constructor(
    private notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    // ... tạo booking ...
    
    // Gửi thông báo
    await this.notificationsService.sendBookingConfirmation(userId, booking);
  }
}
```

### Direct Usage

```typescript
// Trong controller hoặc service
await this.notificationsService.create({
  userId: targetUserId,
  type: NotificationType.MATCH,
  title: 'Có người tham gia trận đấu của bạn',
  message: 'User X đã tham gia trận đấu Y',
  actionUrl: `/matches/${matchId}`,
  data: { matchId, userId },
});
```

---

## Real-time Updates via Gateway

### Sending to Specific User

```typescript
// Trong MatchGateway hoặc NotificationsGateway
@Injectable()
export class NotificationGateway {
  constructor(private gateway: NotificationsGateway) {}

  notifyUser(userId: string, notification: any) {
    this.gateway.sendNotificationToUser(userId, notification);
  }
}
```

### Broadcasting to Multiple Users

```typescript
// Gửi thông báo đến nhiều người
this.notificationGateway.broadcastToUsers(
  ['user1-id', 'user2-id', 'user3-id'],
  'match_started',
  { matchId, title: 'Trận đấu đã bắt đầu!' }
);
```

---

## Example Usage

### Frontend Integration

```typescript
// React hook cho notifications
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useNotifications(token: string) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/notifications', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications');
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('unread_count', ({ count }) => {
      setUnreadCount(count);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  const markAsRead = (notificationId) => {
    socket?.emit('mark_read', { notificationId });
  };

  const markAllAsRead = () => {
    socket?.emit('mark_all_read');
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## Next Steps

Sau khi hoàn thành Phase 9, toàn bộ các module chính đã được implement:

- ✅ Phase 1-3: Setup & Auth
- ✅ Phase 4: Courts Module
- ✅ Phase 5: Bookings Module
- ✅ Phase 6: Reviews Module
- ✅ Phase 7: Matches Module
- ✅ Phase 8: Payments Module (VNPay)
- ✅ Phase 9: Notifications Module

**Các bước tiếp theo có thể bao gồm:**
- Thêm unit tests
- Tối ưu performance
- Thêm validation nâng cao
- Integration với frontend

---

**Version:** 1.0
**Last Updated:** 2026-05-11
