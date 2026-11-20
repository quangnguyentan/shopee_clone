import { Body, Get, Param, Post, Delete, Patch, Query } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseEntity } from './base.entity';
import { PaginationDto } from './base.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export class BaseController<T extends BaseEntity> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  @ApiOperation({ summary: 'Create resource' })
  @ApiCreatedResponse({ description: 'Resource created successfully.' })
  @ApiBadRequestResponse({ description: 'The request is invalid.' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List resources' })
  @ApiOkResponse({ description: 'Resources returned successfully.' })
  @ApiBadRequestResponse({ description: 'The query parameters are invalid.' })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiOkResponse({ description: 'Resource returned successfully.' })
  @ApiNotFoundResponse({ description: 'The requested resource was not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOneById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resource' })
  @ApiOkResponse({ description: 'Resource updated successfully.' })
  @ApiBadRequestResponse({ description: 'The request is invalid.' })
  @ApiNotFoundResponse({ description: 'The requested resource was not found.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateById(+id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiOkResponse({ description: 'Resource deleted successfully.' })
  @ApiNotFoundResponse({ description: 'The requested resource was not found.' })
  remove(@Param('id') id: string) {
    return this.service.deleteById(+id);
  }
}
