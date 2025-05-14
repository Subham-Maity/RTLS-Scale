import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface LoggerOptions {
  enabled?: boolean;
  logRequest?: boolean;
  logLatency?: boolean;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private static options: LoggerOptions = {
    enabled: true,
    logRequest: true,
    logLatency: true,
  };
  private requestNumber = 0;

  static configure(options: LoggerOptions) {
    LoggerMiddleware.options = { ...LoggerMiddleware.options, ...options };
  }

  use(request: Request, response: Response, next: NextFunction): void {
    if (!LoggerMiddleware.options.enabled) {
      return next();
    }

    this.requestNumber++;
    const { method, originalUrl } = request;
    const start = Date.now();

    // Log request information
    if (LoggerMiddleware.options.logRequest) {
      console.log(`[Request #${this.requestNumber}] ${method} ${originalUrl}`);
    }

    response.on('finish', () => {
      if (!LoggerMiddleware.options.logLatency) {
        return;
      }

      const { statusCode } = response;
      const end = Date.now();
      const latency = end - start;

      // Log response status code and latency
      console.log(
        `[Response #${this.requestNumber}] ${statusCode} completed in ${latency}ms`,
      );
    });

    next();
  }
}
