import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const BUYER_URL = process.env.BUYER_ENV;
  const ADMIN_URL = process.env.ADMIN_ENV;
  const corsOrigins = [BUYER_URL, ADMIN_URL].filter(
    (origin): origin is string => Boolean(origin),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/',
  });
  app.useStaticAssets(join(process.cwd(), 'avatars'), {
    prefix: '/assets/avatars/',
  });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 8082);
}
bootstrap();
