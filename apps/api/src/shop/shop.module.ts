import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, Session])],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
