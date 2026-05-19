export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startRunPoller } = await import('./lib/queue/run-poller');
    startRunPoller();
  }
}
