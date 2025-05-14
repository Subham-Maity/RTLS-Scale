import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Logger } from '@nestjs/common';

export interface LoggerOptions {
  enabled?: boolean;
  logRequest?: boolean;
  logLatency?: boolean;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private static options: LoggerOptions = {
    enabled: true,
    logRequest: true,
    logLatency: true,
  };

  static configure(options: LoggerOptions) {
    LoggerMiddleware.options = { ...LoggerMiddleware.options, ...options };
  }

  use(request: Request, response: Response, next: NextFunction): void {
    if (!LoggerMiddleware.options.enabled) {
      return next();
    }

    const { method, originalUrl } = request;
    const start = Date.now();

    // Check if this is a websocket connection and log it
    if (request.headers.upgrade === 'websocket') {
      this.logger.log(
        `WebSocket connection request received at ${originalUrl}`,
      );
    }
    // Log request information
    else if (LoggerMiddleware.options.logRequest) {
      this.logger.log(`${method} ${originalUrl}`);
    }

    response.on('finish', () => {
      if (!LoggerMiddleware.options.logLatency) {
        return;
      }

      const { statusCode } = response;
      const end = Date.now();
      const latency = end - start;

      // Don't log websocket latency as it's handled separately
      if (request.headers.upgrade !== 'websocket') {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${latency}ms`,
        );
      }
    });

    next();
  }
}
