import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiDocReady, logApplicationDetails, logServerReady } from './logger';
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { configureCors } from './cors';
import { AllExceptionsFilter, HttpExceptionFilter } from './error';

const port: number = 3335;
const prefix: string = 'xam';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));

  // Register HttpExceptionFilter first
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      //TODO: IF needed uncomment
      // whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(prefix);

  const configService = app.get(ConfigService);

  configureCors(app, configService);

  app.use(cookieParser());
  // Register AllExceptionsFilter after HttpExceptionFilter
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  await app.listen(configService.get('PORT') || port, '0.0.0.0');
  return configService;
}

bootstrap().then((configService) => {
  logServerReady(configService.get('PORT') || port);
  logApplicationDetails(configService);
  ApiDocReady(configService.get('port') || port, configService);
});
