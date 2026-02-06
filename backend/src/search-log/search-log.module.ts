import { Module } from '@nestjs/common';
import { SearchLogService } from './search-log.service';
import { SearchLogController } from './search-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchLog } from './entities/search-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog])],
  controllers: [SearchLogController],
  providers: [SearchLogService],
})
export class SearchLogModule {}
