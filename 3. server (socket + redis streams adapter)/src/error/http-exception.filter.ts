import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RecordNotFoundException } from './record-not-found.exception';

@Catch(RecordNotFoundException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: RecordNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
      error: 'Not Found',
      timestamp: new Date().toISOString(),
    });
  }
}
