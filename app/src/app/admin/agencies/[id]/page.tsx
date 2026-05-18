import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAgencyByIdHandler } from '@/lib/modules/agency/agency.container';
import { GetAgencyByIdQuery } from '@/lib/modules/agency/application/queries/get-agency-by-id/get-agency-by-id.query';
import { AgencyNotFoundError } from '@/lib/modules/agency/domain/errors';
import { ScraperStatusIcon } from '@/components/ui/scraper-status-icon/ScraperStatusIcon';
import { Button } from '@/components/ui/button/Button';
import { AgencyForm } from '../AgencyForm';
import { DeleteAgencyForm } from './DeleteAgencyForm';
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

  const overviewConfigured = agency.overviewConfigId !== null;
  const detailConfigured = agency.detailConfigId !== null;
  const showConfigureCTA = !overviewConfigured || !detailConfigured;

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
            {[
              { type: 'overview', configId: agency.overviewConfigId, status: agency.overviewStatus },
              { type: 'detail', configId: agency.detailConfigId, status: agency.detailStatus },
            ].map(({ type, status }) => (
              <div key={type} className={styles.scraperCard}>
                <div className={styles.scraperCardTitle}>{SCRAPER_TYPE_LABELS[type]}</div>
                <div className={styles.scraperCardStatus}>
                  <ScraperStatusIcon status={status as ScraperConfigStatus | null} />
                  {status ?? 'Onbekend'}
                </div>
                <Button
                  text="Bewerk configuratie"
                  variant="secondary"
                  size="sm"
                  href={`/admin/agencies/${agencyId}/scrapers/${type}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <DeleteAgencyForm agencyId={agencyId} listingCount={agency.listingCount} />
    </div>
  );
}
