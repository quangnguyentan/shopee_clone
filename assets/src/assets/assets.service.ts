import { Injectable } from '@nestjs/common';
import { AssetType } from './enums/asset-type.enum';
import { ASSET_SIZE_CONFIG } from './asset-size.config';
import { ASSET_VARIANTS } from './asset-variant.config';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

export type ProductImageResult = {
  imageKey: string;
  images: Record<string, string>;
};

@Injectable()
export class AssetService {
  static resolveUploadDir(type: AssetType) {
    switch (type) {
      case AssetType.AVATAR:
        return 'uploads/avatars';
      case AssetType.PRODUCT:
        return 'uploads/products';
      case AssetType.PRODUCT_DESCRIPTION:
        return 'uploads/product-description';
      case AssetType.SHOP:
        return 'uploads/shops';
      case AssetType.CATEGORY:
        return 'uploads/categories';
      case AssetType.FLASH_SALE:
        return 'uploads/flash_sales';
      default:
        throw new Error('Invalid asset type');
    }
  }

  async saveResizedImage(file: Express.Multer.File, type: AssetType) {
    const size = ASSET_SIZE_CONFIG[type];
    if (!size) throw new Error('No size config');

    const uploadDir = AssetService.resolveUploadDir(type);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = randomUUID() + extname(file.originalname);
    const outputPath = join(uploadDir, filename);

    await sharp(file.buffer)
      .resize(size.width, size.height, { fit: 'cover' })
      .toFile(outputPath);

    return filename;
  }
  async saveProductImages(
    files: Express.Multer.File[],
  ): Promise<ProductImageResult[]> {
    const variants = ASSET_VARIANTS[AssetType.PRODUCT];
    const uploadDir = AssetService.resolveUploadDir(AssetType.PRODUCT);

    fs.mkdirSync(uploadDir, { recursive: true });

    const results: ProductImageResult[] = [];

    for (const file of files) {
      const imageKey = randomUUID();
      const images: Record<string, string> = {};

      for (const [variant, config] of Object.entries(variants)) {
        const suffix =
          variant === 'original' ? '' : variant === 'thumbnail' ? '_tn' : '_sm';

        const filename = `${imageKey}${suffix}.${config.format}`;
        const outputPath = join(uploadDir, filename);

        let img = sharp(file.buffer).resize(config.width, config.height, {
          fit: 'cover',
        });

        if (config.format === 'webp') {
          img = img.webp({ quality: config.quality });
        } else {
          img = img.jpeg({ quality: config.quality });
        }

        await img.toFile(outputPath);

        images[variant] = this.buildPublicUrl(AssetType.PRODUCT, filename);
      }

      results.push({
        imageKey,
        images,
      });
    }

    return results;
  }
  async saveDescriptionImages(files?: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadDir = AssetService.resolveUploadDir(
      AssetType.PRODUCT_DESCRIPTION,
    );
    fs.mkdirSync(uploadDir, { recursive: true });

    const results: { url: string }[] = [];

    for (const file of files) {
      const filename = `${randomUUID()}.webp`;
      const outputPath = join(uploadDir, filename);

      await sharp(file.buffer)
        .toFormat('webp', { quality: 90 })
        .toFile(outputPath);

      results.push({
        url: this.buildPublicUrl(AssetType.PRODUCT_DESCRIPTION, filename),
      });
    }

    return results;
  }
  buildPublicUrl(type: AssetType, filename: string) {
    const base = process.env.ASSET_PUBLIC_BASE_URL;
    return `${base}/${type}/${filename}`;
  }
}
