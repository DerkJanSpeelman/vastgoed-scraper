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
        try {
          await executor.execute(runId);
        } catch (err) {
          // Infrastructure error (DB down, etc.) — executor's own try/catch didn't get to run.
          // Mark the run failed so it doesn't stay permanently in 'running' state.
          try {
            const msg = err instanceof Error ? err.message : String(err);
            await scraperContainer.scraperRunWriteRepository.updateToFailed(runId, msg, {
              stack: err instanceof Error ? err.stack : undefined,
              source: 'worker-infrastructure',
            });
          } catch {
            // If even updateToFailed fails, re-throw so pg-boss can retry/fail the job.
            throw err;
          }
        }
      }
    },
  );
}
