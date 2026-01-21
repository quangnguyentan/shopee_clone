// variant-option/variant-option.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VariantOptionService } from './variant-option.service';
import { UpdateVariantOptionDto } from './dto/update-variant-option.dto';
import { BaseController } from '@/base/base.controller';
import { VariantOption } from './entities/variant-option.entity';
import { Auth } from '@/common/decorators/auth.decorator';
import { CreateVariantOptionWithVariantDto } from './dto/create-variant-option-with-variant.dto';

@Controller('variant-options')
export class VariantOptionController extends BaseController<VariantOption> {
  constructor(protected readonly service: VariantOptionService) {
    super(service);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Auth()
  @Post()
  create(@Body() dto: CreateVariantOptionWithVariantDto) {
    return this.service.createOption(dto);
  }

  @Get('variant/:variantId')
  findByVariant(@Param('variantId') variantId: string) {
    return this.service.findByVariant(+variantId);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantOptionDto) {
    return this.service.updateOption(+id, dto);
  }

  @Auth()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteOption(+id);
  }
}
