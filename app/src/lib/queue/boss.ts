import { PgBoss } from 'pg-boss';

let bossPromise: Promise<PgBoss> | null = null;

async function createBoss(): Promise<PgBoss> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const instance = new PgBoss({ connectionString });
  await instance.start();
  return instance;
}

export function getBoss(): Promise<PgBoss> {
  if (!bossPromise) bossPromise = createBoss();
  return bossPromise;
}

export const SCRAPER_JOB = 'scraper:execute';
