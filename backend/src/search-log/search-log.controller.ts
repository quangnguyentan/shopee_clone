import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { SearchLogService } from './search-log.service';
import { CreateSearchLogDto } from './dto/create-search-log.dto';

@Controller('search-logs')
export class SearchLogController {
  constructor(private readonly searchLogService: SearchLogService) {}

  /**
   * Ghi log khi user search keyword
   * POST /search-logs
   */
  @Post()
  create(@Body() dto: CreateSearchLogDto) {
    return this.searchLogService.create(dto);
  }

  /**
   * Top keyword được search nhiều nhất trong hôm nay
   * GET /search-logs/top/today?limit=10
   */
  @Get('top/today')
  getTodayTopSearch(@Query('limit') limit?: string) {
    return this.searchLogService.getTodayTopSearch(limit ? Number(limit) : 10);
  }

  /**
   * Suggest keyword khi gõ search box
   * GET /search-logs/suggest?q=ao&limit=10
   */
  @Get('suggest')
  suggest(@Query('q') keyword: string, @Query('limit') limit?: string) {
    return this.searchLogService.suggest(keyword, limit ? Number(limit) : 10);
  }

  /**
   * Lấy 1 log (debug / admin)
   * GET /search-logs/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchLogService.findOne(Number(id));
  }

  /**
   * Xóa log (admin / debug)
   * DELETE /search-logs/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchLogService.remove(Number(id));
  }
}
