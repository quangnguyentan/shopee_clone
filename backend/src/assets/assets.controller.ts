import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AssetType } from './enums/asset-type.enum';
import { AssetService } from './assets.service';
import { Auth } from '@/common/decorators/auth.decorator';
import type { Express } from 'express';
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Auth()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.query.type as AssetType;
          cb(null, AssetService.resolveUploadDir(type));
        },
        filename: (_, file, cb) => {
          cb(null, randomUUID() + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: AssetType,
  ) {
    if (!Object.values(AssetType).includes(type)) {
      throw new BadRequestException('Invalid asset type');
    }

    return {
      url: this.assetService.buildPublicUrl(type, file.filename),
    };
  }
}
