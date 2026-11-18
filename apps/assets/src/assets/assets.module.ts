import { Module } from '@nestjs/common';
import { AssetService } from './assets.service';
import { AssetController } from './assets.controller';

@Module({
  imports: [],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
