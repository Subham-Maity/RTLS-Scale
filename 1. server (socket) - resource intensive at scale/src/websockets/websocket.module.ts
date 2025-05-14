import { Module } from '@nestjs/common';
import { LocationGateway } from './location.gateway';

@Module({
  imports: [],
  providers: [LocationGateway],
})
export class WebsocketModule {}
