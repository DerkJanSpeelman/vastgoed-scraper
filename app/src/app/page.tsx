import { Suspense } from "react";
import { listingContainer } from "@/lib/modules/listing/listing.container";
import { locationContainer } from "@/lib/modules/location/location.container";
import { GetListingsQuery, GetListingsFilters, ListingsSortBy } from "@/lib/modules/listing/application/queries/get-listings/get-listings.query";
import { Topbar } from "@/components/ui/topbar/Topbar";
import { FilterBar } from "@/components/modules/listing/FilterBar";
import { ListingRow } from "@/components/modules/listing/ListingRow";
import { Pagination } from "@/components/modules/listing/Pagination";
import { Footer } from "@/components/ui/footer/Footer";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

interface HomePageProps {
  searchParams: Promise<{
    nieuwbouw?: string;
    bestaandeBouw?: string;
    stilleVerkoop?: string;
    stad?: string | string[];
    gemeente?: string | string[];
    provincie?: string;
    energie?: string;
    minPrijs?: string;
    maxPrijs?: string;
    minWoon?: string;
    maxWoon?: string;
    minPerceel?: string;
    maxPerceel?: string;
    sorteer?: string;
    pagina?: string;
  }>;
}

function parseIds(val: string | string[] | undefined): number[] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(Number).filter((n) => !isNaN(n) && n > 0);
}

function parsePositiveInt(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseInt(val, 10);
  return isNaN(n) || n <= 0 ? undefined : n;
}

function buildFilters(sp: Awaited<HomePageProps["searchParams"]>): GetListingsFilters {
  const filters: GetListingsFilters = {};

  if (sp.nieuwbouw === "1") filters.isNieuwbouw = true;
  if (sp.bestaandeBouw === "1") filters.isBestaandeBouw = true;
  if (sp.stilleVerkoop === "1") filters.isStilleVerkoop = true;

  const cityIds = parseIds(sp.stad);
  if (cityIds.length > 0) filters.cityIds = cityIds;

  const gemIds = parseIds(sp.gemeente);
  if (gemIds.length > 0) filters.municipalityIds = gemIds;

  if (sp.energie) {
    const labels = sp.energie.split(",").map((l) => l.trim()).filter(Boolean);
    if (labels.length > 0) filters.energyLabels = labels;
  }

  const minPrijs = parsePositiveInt(sp.minPrijs);
  if (minPrijs !== undefined) filters.minPrice = minPrijs;

  const maxPrijs = parsePositiveInt(sp.maxPrijs);
  if (maxPrijs !== undefined) filters.maxPrice = maxPrijs;

  const minWoon = parsePositiveInt(sp.minWoon);
  if (minWoon !== undefined) filters.minLivingArea = minWoon;

  const maxWoon = parsePositiveInt(sp.maxWoon);
  if (maxWoon !== undefined) filters.maxLivingArea = maxWoon;

  const minPerceel = parsePositiveInt(sp.minPerceel);
  if (minPerceel !== undefined) filters.minPlotArea = minPerceel;

  const maxPerceel = parsePositiveInt(sp.maxPerceel);
  if (maxPerceel !== undefined) filters.maxPlotArea = maxPerceel;

  return filters;
}

function buildSortBy(sorteer: string | undefined): ListingsSortBy {
  if (sorteer === "prijs-laag") return "price-asc";
  if (sorteer === "prijs-hoog") return "price-desc";
  return "newest";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;

  const filters = buildFilters(sp);
  const sortBy  = buildSortBy(sp.sorteer);
  const page    = Math.max(1, parseInt(sp.pagina ?? "1", 10) || 1);
  const offset  = (page - 1) * PAGE_SIZE;

  const [result, provinces, cities, municipalities, stats] = await Promise.all([
    listingContainer.getListingsHandler.execute(new GetListingsQuery(filters, sortBy, PAGE_SIZE, offset)),
    locationContainer.getProvincesHandler.execute(),
    locationContainer.getCitiesHandler.execute(),
    locationContainer.getMunicipalitiesHandler.execute(),
    listingContainer.getListingStatsHandler.execute(),
  ]);

  const { items: listings, total } = result;

  return (
    <>
      <Topbar listingCount={stats.total} />

      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Nederlandse woningen,<br />
              <em className={styles.heroAccent}>direct uit de bron</em>
            </h1>
            <p className={styles.heroLede}>
              Geaggregeerde makelaarsdata — nieuwbouw, bestaande bouw en stille verkoop
              in één overzicht.
            </p>
          </div>

          <dl className={styles.stats}>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Woningen</dt>
              <dd className={styles.statValue}>{stats.total}</dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Nieuwbouw</dt>
              <dd className={styles.statValue}>{stats.nieuwbouw}</dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Stille verkoop</dt>
              <dd className={`${styles.statValue} ${styles.statAccent}`}>
                {stats.stilleVerkoop}
              </dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Makelaars</dt>
              <dd className={styles.statValue}>{stats.agencies}</dd>
            </div>
          </dl>
        </section>

        <Suspense>
          <FilterBar
            provinces={provinces}
            cities={cities}
            municipalities={municipalities}
            counts={{
              total:        stats.total,
              nieuwbouw:    stats.nieuwbouw,
              bestaandeBouw: stats.bestaandeBouw,
              stilleVerkoop: stats.stilleVerkoop,
            }}
          />
        </Suspense>

        <div className={styles.list}>
          {listings.length === 0 ? (
            <div className={styles.empty}>
              <strong>Geen woningen gevonden</strong>
              Pas de filters aan om meer resultaten te zien.
            </div>
          ) : (
            listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))
          )}
        </div>

        <div className={styles.paginationWrap}>
          <Suspense>
            <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} />
          </Suspense>
        </div>
      </main>

      <Footer agencyCount={stats.agencies} />
    </>
  );
}
