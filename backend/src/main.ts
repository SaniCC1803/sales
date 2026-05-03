import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { NoCacheMiddleware } from './common/middleware/no-cache.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getAccessSecret, getRefreshSecret } from './auth/jwt-secrets';
import { join } from 'path';

async function bootstrap() {
  // Fail fast at boot if secrets are missing, instead of on the first login.
  getAccessSecret();
  getRefreshSecret();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      // crossOriginResourcePolicy must allow the frontend to load /uploads/* images
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(new NoCacheMiddleware().use.bind(new NoCacheMiddleware()));
  await app.listen(3000);
}
void bootstrap();
