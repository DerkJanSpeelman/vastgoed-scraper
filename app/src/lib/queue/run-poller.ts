import { scraperContainer } from '@/lib/modules/scraper/scraper.container';

const POLL_INTERVAL_MS = 5_000;

// Tracks whether a run is currently being executed so we don't start a second one
// while the first is still running.
let executing = false;

async function poll(): Promise<void> {
  if (!executing) {
    const runId = await scraperContainer.scraperReadRepository.findOldestPendingRunId();
    if (runId !== null) {
      executing = true;
      scraperContainer.scraperExecutor.execute(runId)
        .catch((err) => {
          console.error(`[run-poller] unhandled error on run ${runId}:`, err);
        })
        .finally(() => {
          executing = false;
        });
    }
  }
  setTimeout(poll, POLL_INTERVAL_MS);
}

export function startRunPoller(): void {
  setTimeout(poll, 1_000);
}
