import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { File } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AssetType } from './enums/asset-type.enum';
import { AssetService } from './assets.service';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, AssetService.resolveUploadDir(req.query.type));
        },
        filename: (_, file, cb) => {
          const name = randomUUID() + extname(file.originalname);
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: File, @Query('type') type: AssetType) {
    return {
      url: this.assetService.buildPublicUrl(type, file.filename),
    };
  }
}
