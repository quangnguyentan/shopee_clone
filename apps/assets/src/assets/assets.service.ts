import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { AssetType } from './enums/asset-type.enum';
import { ASSET_SIZE_CONFIG } from './asset-size.config';
import { ASSET_VARIANTS } from './asset-variant.config';

export type ProductImageResult = {
  imageKey: string;
  images: Record<string, string>;
};

type ProductImageVariantConfig =
  (typeof ASSET_VARIANTS)[AssetType.PRODUCT][keyof (typeof ASSET_VARIANTS)[AssetType.PRODUCT]];

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  async saveResizedImage(
    file: Express.Multer.File,
    type: AssetType,
  ): Promise<string> {
    const size = ASSET_SIZE_CONFIG[type];
    if (!size) throw new Error(`No size config for asset type "${type}"`);

    const buffer = await sharp(file.buffer)
      .resize(size.width, size.height, { fit: 'cover' })
      .toBuffer();
    const uploaded = await this.uploadBuffer(buffer, {
      folder: `shopee-clone/${type}`,
      public_id: randomUUID(),
    });

    return uploaded.secure_url;
  }

  async saveProductImages(
    files: Express.Multer.File[],
  ): Promise<ProductImageResult[]> {
    const variants = ASSET_VARIANTS[AssetType.PRODUCT];
    const results: ProductImageResult[] = [];

    for (const file of files) {
      const imageKey = randomUUID();
      const originalConfig = variants.original;
      const originalBuffer = await sharp(file.buffer)
        .resize(originalConfig.width, originalConfig.height, { fit: 'cover' })
        .jpeg({ quality: originalConfig.quality })
        .toBuffer();
      const uploaded = await this.uploadBuffer(originalBuffer, {
        folder: `shopee-clone/${AssetType.PRODUCT}`,
        public_id: imageKey,
        format: originalConfig.format,
      });

      results.push({
        imageKey,
        images: {
          original: uploaded.secure_url,
          thumbnail: this.buildTransformedUrl(
            uploaded.secure_url,
            variants.thumbnail,
          ),
          small: this.buildTransformedUrl(uploaded.secure_url, variants.small),
        },
      });
    }

    return results;
  }

  async saveDescriptionImages(files?: Express.Multer.File[]) {
    if (!files || files.length === 0) return [];

    const results: { url: string }[] = [];
    for (const file of files) {
      const buffer = await sharp(file.buffer)
        .webp({ quality: 90 })
        .toBuffer();
      const uploaded = await this.uploadBuffer(buffer, {
        folder: `shopee-clone/${AssetType.PRODUCT_DESCRIPTION}`,
        public_id: randomUUID(),
        format: 'webp',
      });
      results.push({ url: uploaded.secure_url });
    }

    return results;
  }

  private buildTransformedUrl(
    url: string,
    config: ProductImageVariantConfig,
  ): string {
    const uploadSegment = '/image/upload/';
    const index = url.indexOf(uploadSegment);
    if (index < 0) {
      throw new Error('Cloudinary returned an unexpected image URL');
    }

    const transformation = `c_fill,w_${config.width},h_${config.height},q_${config.quality},f_${config.format}`;
    const insertAt = index + uploadSegment.length;
    return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`;
  }

  private async uploadBuffer(
    buffer: Buffer,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const client = this.getCloudinaryClient();

    return new Promise((resolve, reject) => {
      client.uploader
        .upload_stream(
          {
            ...options,
            overwrite: true,
            resource_type: 'image',
          },
          (error: UploadApiErrorResponse, result?: UploadApiResponse) => {
            if (error) {
              this.logger.error(`Cloudinary upload failed: ${error.message}`);
              reject(
                new ServiceUnavailableException('Cloudinary image upload failed'),
              );
              return;
            }
            if (!result?.secure_url) {
              reject(
                new ServiceUnavailableException(
                  'Cloudinary returned no secure image URL',
                ),
              );
              return;
            }

            resolve(result);
          },
        )
        .end(buffer);
    });
  }

  private getCloudinaryClient() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before uploading images',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }
}
