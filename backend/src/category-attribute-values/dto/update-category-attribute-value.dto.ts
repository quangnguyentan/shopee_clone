import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryAttributeValueDto } from './create-category-attribute-value.dto';

export class UpdateCategoryAttributeValueDto extends PartialType(CreateCategoryAttributeValueDto) {}
