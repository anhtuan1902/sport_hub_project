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
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MatchesService } from './matches.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userName?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/matches',
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MatchGateway');
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();

  constructor(
    private readonly matchesService: MatchesService,
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
      this.socketUsers.delete(client.id);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join_match')
  async handleJoinMatch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const roomName = `match:${data.matchId}`;
    await client.join(roomName);

    this.logger.log(`User ${client.userId} joined room ${roomName}`);

    client.to(roomName).emit('user_joined', {
      matchId: data.matchId,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true, room: roomName };
  }

  @SubscribeMessage('leave_match')
  async handleLeaveMatch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const roomName = `match:${data.matchId}`;
    await client.leave(roomName);

    client.to(roomName).emit('user_left', {
      matchId: data.matchId,
      userId: client.userId,
      userName: client.userName,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; content: string; messageType?: string },
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const message = await this.matchesService.sendMessage(data.matchId, client.userId, {
        content: data.content,
        messageType: data.messageType || 'text',
      });

      const roomName = `match:${data.matchId}`;
      this.server.to(roomName).emit('new_message', message);

      return { success: true, message };
    } catch (error) {
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) return;

    const roomName = `match:${data.matchId}`;
    client.to(roomName).emit('user_typing', {
      matchId: data.matchId,
      userId: client.userId,
      userName: client.userName,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) return;

    const roomName = `match:${data.matchId}`;
    client.to(roomName).emit('user_typing', {
      matchId: data.matchId,
      userId: client.userId,
      userName: client.userName,
      isTyping: false,
    });
  }

  emitMatchUpdate(matchId: string, update: any) {
    const roomName = `match:${matchId}`;
    this.server.to(roomName).emit('match_updated', update);
  }

  emitPlayerJoined(matchId: string, player: any) {
    const roomName = `match:${matchId}`;
    this.server.to(roomName).emit('player_joined', player);
  }

  emitPlayerLeft(matchId: string, playerId: string) {
    const roomName = `match:${matchId}`;
    this.server.to(roomName).emit('player_left', { playerId });
  }

  emitMatchStatusChanged(matchId: string, status: string) {
    const roomName = `match:${matchId}`;
    this.server.to(roomName).emit('match_status_changed', { matchId, status });
  }
}
