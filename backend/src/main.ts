import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { SessionActivityInterceptor } from './session/interceptors/session-activity.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

const BUYER_URL = process.env.BUYER_ENV;
const ADMIN_URL = process.env.ADMIN_ENV;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsOrigins = [BUYER_URL, ADMIN_URL].filter(
    (origin): origin is string => Boolean(origin),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(app.get(SessionActivityInterceptor));
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-scope'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
