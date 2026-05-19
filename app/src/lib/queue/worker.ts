import { type Job } from 'pg-boss';
import { getBoss, SCRAPER_JOB } from './boss';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { ScraperExecutor } from '@/lib/modules/scraper/infrastructure/services/scraper-executor';
import { PlaywrightFetchService } from '@/lib/modules/scraper/infrastructure/services/playwright-fetch.service';

export async function startScraperWorker(): Promise<void> {
  const boss = await getBoss();

  const executor = new ScraperExecutor(
    scraperContainer.scraperReadRepository,
    scraperContainer.scraperRunWriteRepository,
    new PlaywrightFetchService(),
  );

  await boss.work<{ runId: number }>(
    SCRAPER_JOB,
    { localConcurrency: 2 },
    async (jobs: Job<{ runId: number }>[]) => {
      for (const job of jobs) {
        const { runId } = job.data;
        console.log(`[worker] executing scraper run ${runId}`);
        await executor.execute(runId);
        console.log(`[worker] finished scraper run ${runId}`);
      }
    },
  );

  console.log('[worker] scraper worker started');
}
