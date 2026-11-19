import { existsSync } from 'fs';
import { basename, extname, isAbsolute, relative, resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Client } from 'pg';
import { AssetType } from '../src/assets/enums/asset-type.enum';

type AssetColumn = {
  table: string;
  column: string;
};

type AssetRow = {
  id: string | number;
  value: string;
};

type DescriptionRow = {
  id: string | number;
  description: string;
};

type LocalAsset = {
  type: AssetType;
  sourcePath: string;
  publicId: string;
};

const assetColumns: AssetColumn[] = [
  { table: 'categories', column: 'image_url' },
  { table: 'product_images', column: 'url' },
  { table: 'shops', column: 'logo' },
  { table: 'users', column: 'avatar' },
  { table: 'flash_sales', column: 'banner_image' },
];

const localAssetSqlPattern = '^https?://(localhost|127[.]0[.]0[.]1)(:[0-9]+)?/';
const localAssetUrlPattern =
  /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(?:avatars|products|shops|categories|product-description|flash-sales)\/[^"'()<>\s]+/gi;

function loadEnvironment() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  dotenv.config({ path: resolve(process.cwd(), `.env.${nodeEnv}.local`) });
  dotenv.config({ path: resolve(process.cwd(), '.env') });
  dotenv.config({
    path: resolve(process.cwd(), '..', 'api', `.env.${nodeEnv}.local`),
  });
  dotenv.config({ path: resolve(process.cwd(), '..', 'api', '.env') });
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in apps/assets/.env.development.local',
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function getLocalAsset(value: string): LocalAsset | null {
  const url = new URL(value);
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) return null;

  const [type, ...pathSegments] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (
    !type ||
    !Object.values(AssetType).includes(type as AssetType) ||
    pathSegments.length === 0
  ) {
    return null;
  }

  const assetType = type as AssetType;
  const diskFolder =
    assetType === AssetType.FLASH_SALE ? 'flash_sales' : assetType;
  const uploadsRoot = resolve(process.cwd(), 'uploads');
  const sourcePath = resolve(uploadsRoot, diskFolder, ...pathSegments);
  const relativePath = relative(uploadsRoot, sourcePath);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Invalid local asset path: ${url.pathname}`);
  }

  return {
    type: assetType,
    sourcePath,
    publicId: basename(sourcePath, extname(sourcePath)),
  };
}

async function main() {
  loadEnvironment();
  configureCloudinary();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured in the API environment');
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const rowsByColumn = new Map<AssetColumn, AssetRow[]>();
  const descriptions: DescriptionRow[] = [];
  const localAssets = new Map<string, LocalAsset>();
  const missingFiles = new Set<string>();
  let transactionStarted = false;

  await client.connect();
  try {
    for (const assetColumn of assetColumns) {
      const { table, column } = assetColumn;
      const result = await client.query<AssetRow>(
        `SELECT id, "${column}" AS value
         FROM "${table}"
         WHERE "${column}" ~* $1`,
        [localAssetSqlPattern],
      );
      rowsByColumn.set(assetColumn, result.rows);
    }

    const descriptionResult = await client.query<DescriptionRow>(
      `SELECT id, description
       FROM products
       WHERE description ~* $1`,
      [localAssetSqlPattern],
    );
    descriptions.push(...descriptionResult.rows);

    const localUrls = new Set<string>();
    for (const rows of rowsByColumn.values()) {
      for (const row of rows) localUrls.add(row.value);
    }
    for (const row of descriptions) {
      for (const url of row.description.match(localAssetUrlPattern) ?? []) {
        localUrls.add(url);
      }
    }

    for (const url of localUrls) {
      const localAsset = getLocalAsset(url);
      if (!localAsset) {
        missingFiles.add(url);
        continue;
      }
      if (!existsSync(localAsset.sourcePath)) {
        missingFiles.add(`${localAsset.type}/${basename(localAsset.sourcePath)}`);
        continue;
      }
      localAssets.set(url, localAsset);
    }

    const migratedUrls = new Map<string, string>();
    for (const [localUrl, localAsset] of localAssets) {
      const uploaded = await cloudinary.uploader.upload(localAsset.sourcePath, {
        folder: `shopee-clone/${localAsset.type}`,
        public_id: localAsset.publicId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      });
      migratedUrls.set(localUrl, uploaded.secure_url);
    }

    await client.query('BEGIN');
    transactionStarted = true;
    let updatedRows = 0;
    for (const [assetColumn, rows] of rowsByColumn) {
      for (const row of rows) {
        const cloudinaryUrl = migratedUrls.get(row.value);
        if (!cloudinaryUrl) continue;

        await client.query(
          `UPDATE "${assetColumn.table}"
           SET "${assetColumn.column}" = $1
           WHERE id = $2`,
          [cloudinaryUrl, row.id],
        );
        updatedRows++;
      }
    }

    for (const row of descriptions) {
      const updatedDescription = row.description.replace(
        localAssetUrlPattern,
        (url) => migratedUrls.get(url) ?? url,
      );
      if (updatedDescription === row.description) continue;

      await client.query(
        'UPDATE products SET description = $1 WHERE id = $2',
        [updatedDescription, row.id],
      );
      updatedRows++;
    }

    await client.query('COMMIT');
    transactionStarted = false;
    console.log(
      `Updated ${updatedRows} database fields with Cloudinary URLs.`,
    );
    if (missingFiles.size > 0) {
      console.error(
        `${missingFiles.size} local assets were not migrated because their source files are missing or their URL path is unsupported:`,
      );
      for (const missing of missingFiles) console.error(`- ${missing}`);
      process.exitCode = 1;
    }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Local asset migration failed: ${message}`);
  process.exitCode = 1;
});
