import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperRunsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-runs/get-scraper-runs.query';
import { ScraperRunsTable } from './ScraperRunsTable';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function ScraperRunsPage() {
  const runs = await scraperContainer.getScraperRunsHandler.execute(new GetScraperRunsQuery());

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Scraper runs</h1>
      </div>

      {runs.length === 0 ? (
        <div className={styles.empty}>Nog geen scraper runs. Start een handmatige run via de makelaar pagina.</div>
      ) : (
        <ScraperRunsTable runs={runs} />
      )}
    </div>
  );
}
