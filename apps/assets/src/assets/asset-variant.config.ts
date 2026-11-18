import { AssetType } from './enums/asset-type.enum';

export const ASSET_VARIANTS = {
  [AssetType.PRODUCT]: {
    original: { width: 800, height: 800, format: 'jpg', quality: 90 },
    thumbnail: { width: 320, height: 320, format: 'webp', quality: 80 },
    small: { width: 180, height: 180, format: 'webp', quality: 70 },
  },
};
