'use client';

import Link from 'next/link';
import { Table, ColumnDef } from '@/components/ui/table/Table';
import { ScraperStatusIcon } from '@/components/ui/scraper-status-icon/ScraperStatusIcon';
import { GetAgenciesDto, ScraperConfigStatus } from '@/lib/modules/agency/application/queries/get-agencies/get-agencies.dto';
import styles from './page.module.css';

const DATA_SOURCE_LABELS: Record<string, string> = {
  scraper: 'Scraper',
  mailing_list: 'Mailinglijst',
  both: 'Beide',
};

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const columns: ColumnDef<GetAgenciesDto>[] = [
  {
    key: 'name',
    header: 'Naam',
    sortable: true,
    sortValue: (r) => r.name,
    render: (r) => r.name,
  },
  {
    key: 'website',
    header: 'Website',
    render: (r) =>
      r.websiteUrl ? (
        <a
          href={r.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.websiteLink}
          onClick={(e) => e.stopPropagation()}
        >
          {safeHostname(r.websiteUrl)}
        </a>
      ) : (
        <span className={styles.emptyCell}>—</span>
      ),
  },
  {
    key: 'listings',
    header: 'Listings',
    align: 'right',
    sortable: true,
    sortValue: (r) => r.listingCount,
    render: (r) => r.listingCount,
  },
  {
    key: 'scrapers',
    header: 'Scrapers',
    render: (r) => (
      <span className={styles.scraperIcons}>
        <ScraperStatusIcon status={r.overviewStatus as ScraperConfigStatus | null} />
        <ScraperStatusIcon status={r.detailStatus as ScraperConfigStatus | null} />
      </span>
    ),
  },
  {
    key: 'dataSource',
    header: 'Databron',
    render: (r) => DATA_SOURCE_LABELS[r.dataSource] ?? r.dataSource,
  },
  {
    key: 'lastRun',
    header: 'Laatste run',
    sortable: true,
    sortValue: (r) => r.lastRunAt ?? '0000-00-00T00:00:00.000Z',
    render: (r) => formatDate(r.lastRunAt),
  },
  {
    key: 'actions',
    header: '',
    render: (r) => (
      <span className={styles.actionsCell}>
        <Link
          href={`/admin/agencies/${r.id}`}
          className={styles.editLink}
          onClick={(e) => e.stopPropagation()}
        >
          Bewerken
        </Link>
      </span>
    ),
  },
];

interface AgenciesTableProps {
  agencies: GetAgenciesDto[];
}

export function AgenciesTable({ agencies }: AgenciesTableProps) {
  return (
    <Table
      columns={columns}
      data={agencies}
      rowKey={(r) => r.id}
    />
  );
}
