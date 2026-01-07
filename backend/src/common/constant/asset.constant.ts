import { join } from 'path';

export const PUBLIC_ROOT = join(process.cwd(), 'public');
export const ASSET_ROOT = join(PUBLIC_ROOT, 'assets');

export const AVATAR_DIR = join(ASSET_ROOT, 'avatars');
export const PRODUCT_DIR = join(ASSET_ROOT, 'products');

export const AVATAR_DEFAULT = '/assets/avatars/avatar_default.jpg';
