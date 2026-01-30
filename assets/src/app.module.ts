import { Module } from '@nestjs/common';
import { AssetModule } from './assets/assets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}.local`
        : '.env.development.local',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    AssetModule,
  ],
})
export class AppModule {}
