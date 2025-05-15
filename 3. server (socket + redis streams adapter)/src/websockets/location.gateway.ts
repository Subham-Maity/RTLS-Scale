// location.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
@WebSocketGateway({
  namespace: '/', // Optional, as it's the default
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger('LocationGateway');
  private activeUsers = 0;

  constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {}

  handleConnection(client: Socket) {
    this.activeUsers++;
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('active-users', this.activeUsers);
  }

  handleDisconnect(client: Socket) {
    this.activeUsers = Math.max(0, this.activeUsers - 1);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('user-disconnected', client.id);
    this.server.emit('active-users', this.activeUsers);
  }

  @SubscribeMessage('send-location')
  handleLocation(
    client: Socket,
    data: { latitude: number; longitude: number },
  ) {
    this.logger.log(`Location received from ${client.id}:`, data);
    const locationData = {
      id: client.id,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    this.server.emit('receive-location', locationData);
    this.server.to(client.id).emit('receive-location', locationData);
  }

  @SubscribeMessage('track-driver')
  handleTrackDriver(client: Socket, driverId: string) {
    this.logger.log(`Client ${client.id} is tracking driver ${driverId}`);
    client.join(driverId);
  }
}
