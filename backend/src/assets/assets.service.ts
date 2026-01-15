import { Injectable } from '@nestjs/common';
import { AssetType } from './enums/asset-type.enum';
import {
  AVATAR_DIR,
  CATEGORY_DIR,
  PRODUCT_DIR,
  SHOP_DIR,
} from '@/common/constant/asset.constant';

@Injectable()
export class AssetService {
  static resolveUploadDir(type: AssetType) {
    switch (type) {
      case AssetType.AVATAR:
        return AVATAR_DIR;
      case AssetType.PRODUCT:
        return PRODUCT_DIR;
      case AssetType.SHOP:
        return SHOP_DIR;
      case AssetType.CATEGORY:
        return CATEGORY_DIR;
      default:
        throw new Error('Invalid asset type');
    }
  }

  buildPublicUrl(type: AssetType, filename: string) {
    return `/assets/${type}s/${filename}`;
  }
}
