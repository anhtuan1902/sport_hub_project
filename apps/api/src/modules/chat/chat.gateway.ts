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
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';
import { MessageType } from './enums';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userName?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();
  private userConversations: Map<string, Set<string>> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub || payload.id;
      client.userName = payload.fullName || payload.email;

      const userSockets = this.userSockets.get(client.userId) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(client.userId, userSockets);
      this.socketUsers.set(client.id, client.userId);

      this.logger.log(`User ${client.userId} connected with socket ${client.id}`);

      this.server.emit('online_status', {
        userId: client.userId,
        isOnline: true,
      });
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

          this.server.emit('online_status', {
            userId: client.userId,
            isOnline: false,
          });
        }
      }

      const conversations = this.userConversations.get(client.userId);
      if (conversations) {
        for (const conversationId of conversations) {
          client.leave(`conversation:${conversationId}`);
        }
        this.userConversations.delete(client.userId);
      }

      this.socketUsers.delete(client.id);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      await this.chatService.findOneConversation(data.conversationId, client.userId);

      const roomName = `conversation:${data.conversationId}`;
      await client.join(roomName);

      const conversations = this.userConversations.get(client.userId) || new Set();
      conversations.add(data.conversationId);
      this.userConversations.set(client.userId, conversations);

      this.logger.log(`User ${client.userId} joined conversation room ${roomName}`);

      client.to(roomName).emit('user_joined', {
        conversationId: data.conversationId,
        userId: client.userId,
        userName: client.userName,
        timestamp: new Date(),
      });

      return { success: true, room: roomName };
    } catch (error) {
      throw new WsException(error.message || 'Failed to join conversation');
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const roomName = `conversation:${data.conversationId}`;
    await client.leave(roomName);

    const conversations = this.userConversations.get(client.userId);
    if (conversations) {
      conversations.delete(data.conversationId);
    }

    client.to(roomName).emit('user_left', {
      conversationId: data.conversationId,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      conversationId: string;
      content: string;
      messageType?: MessageType;
      metadata?: Record<string, any>;
      replyToId?: string;
    },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const dto: SendMessageDto = {
        content: data.content,
        messageType: data.messageType || MessageType.TEXT,
        metadata: data.metadata,
        replyToId: data.replyToId,
      };

      const message = await this.chatService.sendMessage(data.conversationId, client.userId, dto);

      const roomName = `conversation:${data.conversationId}`;
      this.server.to(roomName).emit('new_message', message);

      return { success: true, message };
    } catch (error) {
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    const roomName = `conversation:${data.conversationId}`;
    client.to(roomName).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      userName: client.userName,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.userId) return;

    const roomName = `conversation:${data.conversationId}`;
    client.to(roomName).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      userName: client.userName,
      isTyping: false,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      await this.chatService.markAsRead(data.conversationId, client.userId, data.messageId);

      const roomName = `conversation:${data.conversationId}`;
      this.server.to(roomName).emit('message_read', {
        conversationId: data.conversationId,
        userId: client.userId,
        messageId: data.messageId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      throw new WsException(error.message || 'Failed to mark as read');
    }
  }

  emitNewMessage(conversationId: string, message: any) {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('new_message', message);
  }

  emitMessageEdited(conversationId: string, messageId: string, content: string, updatedAt: Date) {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('message_edited', {
      conversationId,
      messageId,
      content,
      updatedAt,
    });
  }

  emitMessageDeleted(conversationId: string, messageId: string) {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('message_deleted', {
      conversationId,
      messageId,
    });
  }

  emitConversationUpdated(conversationId: string, update: any) {
    const roomName = `conversation:${conversationId}`;
    this.server.to(roomName).emit('conversation_updated', {
      conversationId,
      ...update,
    });
  }

  emitUnreadCount(userId: string, count: number) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('unread_count', { count });
        }
      }
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    }
  }
}
