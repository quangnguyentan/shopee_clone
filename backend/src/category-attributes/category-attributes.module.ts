import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '@/session/entities/session.entity';
import { CategoryAttributeController } from './category-attributes.controller';
import { CategoryAttributeService } from './category-attributes.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryAttribute, Session])],
  controllers: [CategoryAttributeController],
  providers: [CategoryAttributeService],
  exports: [CategoryAttributeService],
})
export class CategoryAttributeModule {}
