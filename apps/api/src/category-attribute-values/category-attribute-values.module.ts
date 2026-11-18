import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '@/session/entities/session.entity';
import { CategoryAttributeValueController } from './category-attribute-values.controller';
import { CategoryAttributeValueService } from './category-attribute-values.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryAttributeValue, Session])],
  controllers: [CategoryAttributeValueController],
  providers: [CategoryAttributeValueService],
  exports: [CategoryAttributeValueService],
})
export class CategoryAttributeValueModule {}
