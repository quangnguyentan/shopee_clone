import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantAttributeDto } from './create-product-variant-attribute.dto';

export class UpdateProductVariantAttributeDto extends PartialType(CreateProductVariantAttributeDto) {}
