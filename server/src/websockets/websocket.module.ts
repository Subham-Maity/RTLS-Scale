import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';

@Module({
  imports: [],
  providers: [WebsocketsGateway],
})
export class WebsocketModule {}
