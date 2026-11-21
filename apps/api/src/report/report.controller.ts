import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@ApiControllerDocs('Reports')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @AuthRole('buyer', 'seller')
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Get()
  @AuthRole('admin')
  findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  @AuthRole('admin')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @Patch(':id')
  @AuthRole('admin')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  @AuthRole('admin')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
