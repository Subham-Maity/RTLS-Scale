import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    this.logger.log('Server is running successfully');
    return `Server is running successfully at ${new Date().toLocaleString()}`;
  }
}
