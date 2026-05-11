import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub || payload.id;

      const userSockets = this.userSockets.get(client.userId) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(client.userId, userSockets);

      await client.join(`user:${client.userId}`);

      this.logger.log(`User ${client.userId} connected with socket ${client.id}`);

      const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
      client.emit('unread_count', unreadCount);
    } catch (error) {
      this.logger.warn(`Client ${client.id} authentication failed`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.userSockets.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const notification = await this.notificationsService.markAsRead(
        data.notificationId,
        client.userId,
      );

      client.emit('notification_read', { notificationId: data.notificationId });

      const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
      client.emit('unread_count', unreadCount);

      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('mark_all_read')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    await this.notificationsService.markAllAsRead(client.userId);

    client.emit('unread_count', { count: 0 });

    return { success: true };
  }

  @SubscribeMessage('request_unread_count')
  async handleRequestUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
    client.emit('unread_count', unreadCount);

    return { count: unreadCount };
  }

  sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.sendToUser(userId, 'new_notification', notification);
  }

  broadcastToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data);
    });
  }
}
