import {Global, Module} from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { PubSubService } from './pubsub.service';
@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [PubSubService, ConfigService],
  exports: [PubSubService],
})
export class RedisModule {}
