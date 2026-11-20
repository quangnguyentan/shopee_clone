import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

const envFile = process.env.NODE_ENV
  ? `.env.${process.env.NODE_ENV}.local`
  : '.env.development.local';
loadEnv({ path: join(process.cwd(), envFile) });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(`DATABASE_URL is required (looked for ${envFile})`);
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations',
  ssl: { rejectUnauthorized: false },
});
