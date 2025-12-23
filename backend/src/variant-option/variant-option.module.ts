import { Module } from '@nestjs/common';
import { VariantOptionService } from './variant-option.service';
import { VariantOptionController } from './variant-option.controller';
import { VariantOption } from './entities/variant-option.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([VariantOption])],
  controllers: [VariantOptionController],
  providers: [VariantOptionService],
})
export class VariantOptionModule {}
