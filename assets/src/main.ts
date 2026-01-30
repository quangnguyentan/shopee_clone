import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

const BUYER_URL = process.env.BUYER_ENV;
const ADMIN_URL = process.env.ADMIN_ENV;

async function bootstrap() {
  console.log(
    process.env.ASSET_PUBLIC_BASE_URL,
    'process.env.ASSET_PUBLIC_BASE_URL',
  );
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsOrigins = [BUYER_URL, ADMIN_URL].filter(
    (origin): origin is string => Boolean(origin),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/',
  });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 8081);
}
bootstrap();
