import { join } from 'path';

export const PUBLIC_DIR = join(process.cwd(), 'public');
export const ASSET_DIR = join(PUBLIC_DIR, 'assets');
export const QR_IMAGE_PATH = join(ASSET_DIR, 'qr.png');
