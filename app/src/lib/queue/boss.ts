import { PgBoss } from 'pg-boss';

let boss: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  boss = new PgBoss({ connectionString });
  await boss.start();
  return boss;
}

export const SCRAPER_JOB = 'scraper:execute';
