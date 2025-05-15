import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
export const allowList = [
  'http://localhost:3333',
  'http://localhost:3001',
  'http://localhost:3000',
];
export const configureCors = (
  app: INestApplication,
  configService: ConfigService,
): void => {
  const logger = new Logger('CORS');
  const nodeEnv = configService.get<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  const corsOptions: CorsOptions = {
    origin: isProduction
      ? (origin, callback) => {
          if (!origin) {
            // Allow requests with no 'Origin' header
            callback(null, true);
            return;
          }

          const allowedOrigins =
            configService.get<string>('ALLOWED_ORIGINS')?.split(',') ||
            allowList;

          const isAllowed = allowedOrigins.indexOf(origin) !== -1;
          if (isAllowed) {
            logger.log(`Origin "${origin}" is whitelisted for CORS.`);
            callback(null, true);
          } else {
            const error = new Error(
              `Origin "${origin}" is not allowed by CORS.`,
            );
            logger.error(error.message);
            callback(error);
          }
        }
      : allowList,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 3600,
    preflightContinue: false,
  };

  app.enableCors(corsOptions);
  logger.log(`CORS config applied: ${JSON.stringify(corsOptions)}`);

  if (isProduction) {
    const allowedOrigins =
      configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [];
    logger.log(
      `CORS is configured for allowed origins: ${allowedOrigins.join(', ')}`,
    );
  }
};
