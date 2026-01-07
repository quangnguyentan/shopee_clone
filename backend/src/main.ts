import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { SessionActivityInterceptor } from './session/interceptors/session-activity.interceptor';

const FRONTEND_URL = process.env.FRONTEND_ENV;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(app.get(SessionActivityInterceptor));
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });
  app.use(cookieParser());
  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
