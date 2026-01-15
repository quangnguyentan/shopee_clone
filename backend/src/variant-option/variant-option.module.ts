import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantOption } from './entities/variant-option.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { VariantOptionService } from './variant-option.service';
import { VariantOptionController } from './variant-option.controller';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VariantOption, ProductVariant, Session])],
  controllers: [VariantOptionController],
  providers: [VariantOptionService],
})
export class VariantOptionModule {}
