import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { logger } from './pino.ts';
import { env } from './env.ts';
import * as schema from '../models/index.ts';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
});

pool.on('error', (err: unknown) => {
  logger.error(err, '❌ Unexpected database error:');
  process.exit(1);
});

export const db = drizzle(pool, { schema });

export const closeDb = async () => {
  logger.info('Closing database pool');
  await pool.end();
};
