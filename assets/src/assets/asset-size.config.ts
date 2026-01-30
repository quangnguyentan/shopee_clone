import { AssetType } from './enums/asset-type.enum';

export const ASSET_SIZE_CONFIG: Record<
  AssetType,
  { width: number; height: number }
> = {
  [AssetType.AVATAR]: { width: 128, height: 128 },
  [AssetType.SHOP]: { width: 600, height: 600 },
  [AssetType.CATEGORY]: { width: 400, height: 400 },
  [AssetType.PRODUCT]: { width: 320, height: 320 },
  [AssetType.PRODUCT_DESCRIPTION]: { width: 320, height: 320 },
};
