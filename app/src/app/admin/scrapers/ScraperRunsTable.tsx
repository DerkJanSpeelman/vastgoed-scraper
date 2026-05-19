'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table } from '@/components/ui/table/Table';
import type { ColumnDef } from '@/components/ui/table/Table';
import type { GetScraperRunsDto } from '@/lib/modules/scraper/application/queries/get-scraper-runs/get-scraper-runs.dto';
import styles from './page.module.css';

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

const COLUMNS: ColumnDef<GetScraperRunsDto>[] = [
  {
    key: 'agencyName',
    header: 'Makelaar',
    sortable: true,
    render: (r) => (
      <Link href={`/admin/agencies/${r.agencyId}`} className={styles.link} onClick={e => e.stopPropagation()}>{r.agencyName}</Link>
    ),
  },
  {
    key: 'configType',
    header: 'Type',
    sortable: true,
    render: (r) => r.configType === 'overview' ? 'Overzicht' : 'Detail',
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: 'triggeredBy',
    header: 'Gestart door',
    sortable: false,
    render: (r) => r.triggeredBy === 'manual' ? 'Handmatig' : 'Gepland',
  },
  {
    key: 'startedAt',
    header: 'Gestart',
    sortable: true,
    render: (r) => formatDate(r.startedAt),
  },
  {
    key: 'finishedAt',
    header: 'Klaar',
    sortable: true,
    render: (r) => formatDate(r.finishedAt),
  },
  {
    key: 'listingsFound',
    header: 'Gevonden',
    sortable: true,
    render: (r) => r.listingsFound ?? '—',
  },
  {
    key: 'listingsAdded',
    header: 'Toegevoegd',
    sortable: true,
    render: (r) => r.listingsAdded ?? '—',
  },
];

interface Props {
  runs: GetScraperRunsDto[];
}

export function ScraperRunsTable({ runs }: Props) {
  const router = useRouter();
  return (
    <Table
      columns={COLUMNS}
      data={runs}
      rowKey={r => r.id}
      onRowClick={r => router.push(`/admin/scrapers/${r.id}`)}
    />
  );
}
