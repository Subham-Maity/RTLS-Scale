// redis-io-adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import Redis from 'ioredis';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private redisClient: Redis;

  constructor(app: INestApplication, redisClient: Redis) {
    super(app);
    this.redisClient = redisClient;
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: '*' },
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });
    server.adapter(createAdapter(this.redisClient));
    return server;
  }
}
