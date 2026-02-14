import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NoCacheMiddleware } from './common/middleware/no-cache.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
