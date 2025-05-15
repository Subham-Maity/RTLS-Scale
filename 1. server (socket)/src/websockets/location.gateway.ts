// location/location.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // In production, set this to your Next.js URL
  },
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger('LocationGateway');
  private activeUsers = 0;

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket Server Initialized');
  }

  handleConnection(client: Socket) {
    this.activeUsers++;
    this.logger.log(`Client connected: ${client.id}`);

    // Broadcast active user count
    this.server.emit('active-users', this.activeUsers);
  }

  handleDisconnect(client: Socket) {
    this.activeUsers = Math.max(0, this.activeUsers - 1);
    this.logger.log(`Client disconnected: ${client.id}`);

    // Emit user disconnection event
    this.server.emit('user-disconnected', client.id);

    // Update active user count
    this.server.emit('active-users', this.activeUsers);
  }

  @SubscribeMessage('send-location')
  handleLocation(
    client: Socket,
    data: { latitude: number; longitude: number },
  ) {
    console.log(`Location received from ${client.id}:`, data);
    // Forward location data to all clients with the sender's ID
    this.server.emit('receive-location', {
      id: client.id,
      ...data,
    });
  }
}
