import { notFound } from 'next/navigation';
import Link from 'next/link';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperRunByIdQuery } from '@/lib/modules/scraper/application/queries/get-scraper-run-by-id/get-scraper-run-by-id.query';
import { DeleteRunButton } from './DeleteRunButton';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'medium' });
}

export default async function ScraperRunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const id = parseInt(runId, 10);
  if (!Number.isFinite(id)) notFound();

  const run = await scraperContainer.getScraperRunByIdHandler.execute(new GetScraperRunByIdQuery(id)).catch(() => null);
  if (!run) notFound();

  return (
    <div>
      <div className={styles.header}>
        <nav className={styles.breadcrumb}>
          <Link href="/admin/scrapers">Scraper runs</Link>
          {' / '}
          Run #{run.id}
        </nav>
      </div>

      {run.status === 'pending' && (
        <div style={{ marginBottom: '1rem' }}>
          <DeleteRunButton runId={run.id} />
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Makelaar</span>
          <span className={styles.value}>
            <Link href={`/admin/agencies/${run.agencyId}`}>{run.agencyName}</Link>
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Type</span>
          <span className={styles.value}>{run.configType === 'overview' ? 'Overzicht' : 'Detail'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Status</span>
          <span className={styles.value}>{run.status}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Gestart door</span>
          <span className={styles.value}>{run.triggeredBy === 'manual' ? 'Handmatig' : 'Gepland'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Gestart op</span>
          <span className={styles.value}>{fmt(run.startedAt)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Klaar op</span>
          <span className={styles.value}>{fmt(run.finishedAt)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Listings gevonden</span>
          <span className={styles.value}>{run.listingsFound ?? '—'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Toegevoegd</span>
          <span className={styles.value}>{run.listingsAdded ?? '—'}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Bijgewerkt</span>
          <span className={styles.value}>{run.listingsUpdated ?? '—'}</span>
        </div>

        {run.errorMessage && (
          <>
            <div className={styles.sectionTitle}>Foutmelding</div>
            <div className={styles.errorBox}>{run.errorMessage}</div>
          </>
        )}

        {run.errorDetails && Object.keys(run.errorDetails).length > 0 && (
          <>
            <div className={styles.sectionTitle}>Foutdetails</div>
            <div className={styles.errorBox}>{JSON.stringify(run.errorDetails, null, 2)}</div>
          </>
        )}
      </div>
    </div>
  );
}
