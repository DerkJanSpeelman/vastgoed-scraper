export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScraperWorker } = await import('./lib/queue/worker');
    startScraperWorker().catch((err) => {
      console.error('[instrumentation] failed to start scraper worker', err);
    });
  }
}
