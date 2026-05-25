import { notFound } from 'next/navigation';
import Link from 'next/link';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperConfigsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.query';
import { getAgencyByIdHandler } from '@/lib/modules/agency/agency.container';
import { GetAgencyByIdQuery } from '@/lib/modules/agency/application/queries/get-agency-by-id/get-agency-by-id.query';
import { ScraperConfigSplitView } from '@/components/modules/scraper/ScraperConfigSplitView';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  overview: 'Overzichtspagina scraper',
  detail: 'Detailpagina scraper',
};

interface Params { id: string; type: string; }

export default async function ScraperConfigPage({ params }: { params: Promise<Params> }) {
  const { id: rawId, type: rawType } = await params;

  if (rawType !== 'overview' && rawType !== 'detail') notFound();
  const type = rawType as 'overview' | 'detail';

  const agencyId = parseInt(rawId, 10);
  if (!Number.isFinite(agencyId)) notFound();

  const [agency, configs] = await Promise.all([
    getAgencyByIdHandler.execute(new GetAgencyByIdQuery(agencyId)).catch(() => null),
    scraperContainer.getScraperConfigsHandler.execute(new GetScraperConfigsQuery(agencyId)),
  ]);

  if (!agency) notFound();

  const existing = configs.find(c => c.type === type) ?? null;
  const typeLabel = TYPE_LABELS[type];

  return (
    <div>
      <div className={styles.pageHeader}>
        <nav className={styles.breadcrumb}>
          <Link href="/admin/agencies">Makelaars</Link>
          {' / '}
          <Link href={`/admin/agencies/${agencyId}`}>{agency.name}</Link>
          {' / '}
          {typeLabel}
        </nav>
      </div>

      <ScraperConfigSplitView
        agencyId={agencyId}
        agencyDomain={agency.websiteUrl}
        type={type}
        existing={existing}
      />
    </div>
  );
}
