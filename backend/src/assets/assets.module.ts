import { Module } from '@nestjs/common';
import { AssetService } from './assets.service';
import { AssetController } from './assets.controller';

@Module({
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
