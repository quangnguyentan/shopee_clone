import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';
import { ProductVariantAttributeController } from './product-variant-attributes.controller';
import { ProductVariantAttributeService } from './product-variant-attributes.service';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariantAttribute, Session])],
  controllers: [ProductVariantAttributeController],
  providers: [ProductVariantAttributeService],
  exports: [ProductVariantAttributeService],
})
export class ProductVariantAttributeModule {}
