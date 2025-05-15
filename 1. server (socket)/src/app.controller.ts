import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Entry Point')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Entry Point',
    description:
      'https://..../xam <- You can use this link to check if the server is running.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a simple message.',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
