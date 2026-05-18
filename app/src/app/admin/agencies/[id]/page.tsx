import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgencyByIdHandler } from '@/lib/modules/agency/agency.container';
import { GetAgencyByIdQuery } from '@/lib/modules/agency/application/queries/get-agency-by-id/get-agency-by-id.query';
import { AgencyNotFoundError } from '@/lib/modules/agency/domain/errors';
import { ScraperStatusIcon } from '@/components/ui/scraper-status-icon/ScraperStatusIcon';
import { Button } from '@/components/ui/button/Button';
import { AgencyForm } from '../AgencyForm';
import { DeleteAgencyForm } from './DeleteAgencyForm';
import { ManualRunButton } from '@/components/modules/scraper/ManualRunButton';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';
import { GetScraperConfigsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.query';
import { GetScraperRunsQuery } from '@/lib/modules/scraper/application/queries/get-scraper-runs/get-scraper-runs.query';
import { ScraperConfigStatus } from '@/lib/modules/agency/application/queries/get-agencies/get-agencies.dto';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const SCRAPER_TYPE_LABELS: Record<string, string> = {
  overview: 'Overzicht pagina scraper',
  detail: 'Detail pagina scraper',
};

export default async function AgencyDetailPage({ params }: Props) {
  const { id } = await params;
  const agencyId = parseInt(id, 10);

  let agency;
  try {
    agency = await getAgencyByIdHandler.execute(new GetAgencyByIdQuery(agencyId));
  } catch (e) {
    if (e instanceof AgencyNotFoundError) notFound();
    throw e;
  }

  const [configs, runs] = await Promise.all([
    scraperContainer.getScraperConfigsHandler.execute(new GetScraperConfigsQuery(agencyId)),
    scraperContainer.getScraperRunsHandler.execute(new GetScraperRunsQuery(agencyId)),
  ]);

  const overviewConfig = configs.find(c => c.type === 'overview') ?? null;
  const detailConfig = configs.find(c => c.type === 'detail') ?? null;
  const overviewConfigured = overviewConfig !== null;
  const detailConfigured = detailConfig !== null;
  const showConfigureCTA = !overviewConfigured || !detailConfigured;

  const lastOverviewRun = runs.filter(r => r.configType === 'overview')[0] ?? null;
  const lastDetailRun = runs.filter(r => r.configType === 'detail')[0] ?? null;

  return (
    <div className={styles.sections}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <Link href="/admin/agencies" className={styles.back}>← Makelaars</Link>
          <h1 className={styles.title}>{agency.name}</h1>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Gegevens</h2>
        <AgencyForm
          mode="edit"
          agencyId={agencyId}
          defaultValues={{
            name: agency.name,
            websiteUrl: agency.websiteUrl,
            dataSource: agency.dataSource,
          }}
        />
      </section>

      {showConfigureCTA && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Scraper configureren</h2>
          <div className={styles.scraperCards}>
            {!overviewConfigured && (
              <div className={styles.scraperCard}>
                <div className={styles.scraperCardTitle}>Overzicht pagina scraper</div>
                <div className={styles.scraperCardStatus}>
                  <ScraperStatusIcon status={agency.overviewStatus as ScraperConfigStatus | null} />
                  Niet geconfigureerd
                </div>
                <Button
                  text="Configureer"
                  variant="secondary"
                  size="sm"
                  href={`/admin/agencies/${agencyId}/scrapers/overview`}
                />
              </div>
            )}
            {!detailConfigured && (
              <div className={styles.scraperCard}>
                <div className={styles.scraperCardTitle}>Detail pagina scraper</div>
                <div className={styles.scraperCardStatus}>
                  <ScraperStatusIcon status={agency.detailStatus as ScraperConfigStatus | null} />
                  Niet geconfigureerd
                </div>
                <Button
                  text="Configureer"
                  variant="secondary"
                  size="sm"
                  href={`/admin/agencies/${agencyId}/scrapers/detail`}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {overviewConfigured && detailConfigured && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Scrapers</h2>
          <div className={styles.scraperCards}>
            {([
              { type: 'overview' as const, config: overviewConfig, status: agency.overviewStatus, lastRun: lastOverviewRun },
              { type: 'detail' as const, config: detailConfig, status: agency.detailStatus, lastRun: lastDetailRun },
            ]).map(({ type, config, status, lastRun }) => (
              <div key={type} className={styles.scraperCard}>
                <div className={styles.scraperCardTitle}>{SCRAPER_TYPE_LABELS[type]}</div>
                <div className={styles.scraperCardStatus}>
                  <ScraperStatusIcon status={status as ScraperConfigStatus | null} />
                  {status ?? 'Onbekend'}
                </div>
                {lastRun && (
                  <div className={styles.scraperCardMeta}>
                    Laatste run: {new Date(lastRun.createdAt).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                    {lastRun.status === 'failed' && (
                      <Link href={`/admin/scrapers/${lastRun.id}`} className={styles.errorLink}> — bekijk fout</Link>
                    )}
                  </div>
                )}
                <div className={styles.scraperCardActions}>
                  <Button
                    text="Bewerk configuratie"
                    variant="secondary"
                    size="sm"
                    href={`/admin/agencies/${agencyId}/scrapers/${type}`}
                  />
                  {config && (
                    <ManualRunButton agencyId={agencyId} scraperConfigId={config.id} type={type} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <DeleteAgencyForm agencyId={agencyId} listingCount={agency.listingCount} />
    </div>
  );
}
