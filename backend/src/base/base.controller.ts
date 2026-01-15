import { Body, Get, Param, Post, Delete, Patch } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseEntity } from './base.entity';

export class BaseController<T extends BaseEntity> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateById(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteById(+id);
  }
}
