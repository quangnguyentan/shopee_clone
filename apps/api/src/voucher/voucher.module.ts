import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherRedemption } from './entities/voucher-redemption.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, VoucherRedemption, Shop, Session])],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
