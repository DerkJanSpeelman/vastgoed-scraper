const SCRAPER_URL = process.env.SCRAPER_URL ?? 'http://scraper:3001';
const TIMEOUT_MS = 20_000;

export class PlaywrightFetchService {
  async fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${SCRAPER_URL}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Scraper returned ${res.status}: ${body}`);
      }
      return await res.text();
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Fetch timed out after ${TIMEOUT_MS}ms for: ${url}`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
