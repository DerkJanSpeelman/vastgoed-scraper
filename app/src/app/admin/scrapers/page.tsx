import Link from 'next/link';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperRunsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-runs/get-scraper-runs.query';
import { Table } from '@/components/ui/table/Table';
import type { GetScraperRunsDto } from '@/lib/modules/scraper/application/queries/get-scraper-runs/get-scraper-runs.dto';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const STATUS_CLASSES: Record<string, string> = {
  pending: styles.statusPending,
  running: styles.statusRunning,
  success: styles.statusSuccess,
  failed:  styles.statusFailed,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Wachtrij',
  running: 'Bezig',
  success: 'Gelukt',
  failed:  'Mislukt',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.statusBadge} ${STATUS_CLASSES[status] ?? styles.statusPending}`}>
      <span className={styles.dot} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function ScraperRunsPage() {
  const runs = await scraperContainer.getScraperRunsHandler.execute(new GetScraperRunsQuery());

  const columns = [
    {
      key: 'agencyName' as keyof GetScraperRunsDto,
      header: 'Makelaar',
      sortable: true,
      render: (r: GetScraperRunsDto) => (
        <Link href={`/admin/agencies/${r.agencyId}`} className={styles.link}>{r.agencyName}</Link>
      ),
    },
    {
      key: 'configType' as keyof GetScraperRunsDto,
      header: 'Type',
      sortable: true,
      render: (r: GetScraperRunsDto) => r.configType === 'overview' ? 'Overzicht' : 'Detail',
    },
    {
      key: 'status' as keyof GetScraperRunsDto,
      header: 'Status',
      sortable: true,
      render: (r: GetScraperRunsDto) => <StatusBadge status={r.status} />,
    },
    {
      key: 'triggeredBy' as keyof GetScraperRunsDto,
      header: 'Gestart door',
      sortable: false,
      render: (r: GetScraperRunsDto) => r.triggeredBy === 'manual' ? 'Handmatig' : 'Gepland',
    },
    {
      key: 'startedAt' as keyof GetScraperRunsDto,
      header: 'Gestart',
      sortable: true,
      render: (r: GetScraperRunsDto) => formatDate(r.startedAt),
    },
    {
      key: 'finishedAt' as keyof GetScraperRunsDto,
      header: 'Klaar',
      sortable: true,
      render: (r: GetScraperRunsDto) => formatDate(r.finishedAt),
    },
    {
      key: 'listingsFound' as keyof GetScraperRunsDto,
      header: 'Gevonden',
      sortable: true,
      render: (r: GetScraperRunsDto) => r.listingsFound ?? '—',
    },
    {
      key: 'id' as keyof GetScraperRunsDto,
      header: '',
      sortable: false,
      render: (r: GetScraperRunsDto) =>
        r.status === 'failed' ? (
          <Link href={`/admin/scrapers/${r.id}`} className={styles.link}>Details →</Link>
        ) : null,
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Scraper runs</h1>
      </div>

      {runs.length === 0 ? (
        <div className={styles.empty}>Nog geen scraper runs. Start een handmatige run via de makelaar pagina.</div>
      ) : (
        <Table columns={columns} data={runs} rowKey={r => r.id} />
      )}
    </div>
  );
}
