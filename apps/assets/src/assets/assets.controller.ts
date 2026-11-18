import {
  Controller,
  Post,
  UseInterceptors,
  Query,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AssetType } from './enums/asset-type.enum';
import { AssetService } from './assets.service';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: memoryStorage() }))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') type: AssetType,
  ) {
    if (!Object.values(AssetType).includes(type)) {
      throw new BadRequestException('Invalid asset type');
    }

    if (type === AssetType.PRODUCT) {
      return this.assetService.saveProductImages(files ?? []);
    }

    if (type === AssetType.PRODUCT_DESCRIPTION) {
      const items = await this.assetService.saveDescriptionImages(files);
      return { items };
    }

    if (!files?.length) {
      throw new BadRequestException('File is required');
    }

    const filename = await this.assetService.saveResizedImage(files[0], type);

    return {
      url: this.assetService.buildPublicUrl(type, filename),
    };
  }
}
