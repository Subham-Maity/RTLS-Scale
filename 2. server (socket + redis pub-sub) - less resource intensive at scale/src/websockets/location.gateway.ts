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
import { PubSubService } from "../redis/pubsub.service";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // In production, set this to your Next.js URL
  },
  path: '/socket.io/', // Explicitly set the Socket.IO path
  transports: ['websocket', 'polling'], // Support both WebSocket and HTTP long-polling
  namespace: '/', // Default namespace
})
export class LocationGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger('LocationGateway');
  private activeUsers = 0;

  @WebSocketServer()
  server: Server;

  // Inject the PubSubService
  constructor(private pubSubService: PubSubService) {
    // Subscribe to the Redis channel for location updates
    this.pubSubService.subscribe('location-updates', (message) => {
      const locationData = JSON.parse(message);
      // Emit to all clients and to the specific room
      this.server.emit('receive-location', locationData);
      // Also emit to the room corresponding to the driver's ID
      this.server.to(locationData.id).emit('receive-location', locationData);
    });
  }

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
    this.logger.log(`Location received from ${client.id}:`, data);
    // Forward location data to all clients with the sender's ID
    const locationData = {
      id: client.id, // Driver's ID
      latitude: data.latitude,
      longitude: data.longitude,
    };
    // Publish to Redis instead of emitting directly
    this.pubSubService.publish('location-updates', JSON.stringify(locationData));
  }

  // Allow clients to track a specific driver
  @SubscribeMessage('track-driver')
  handleTrackDriver(client: Socket, driverId: string) {
    this.logger.log(`Client ${client.id} is tracking driver ${driverId}`);
    client.join(driverId); // Join the room for this driver
  }
}