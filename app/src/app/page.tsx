import { Suspense } from "react";
import { listingContainer } from "@/lib/modules/listing/listing.container";
import { locationContainer } from "@/lib/modules/location/location.container";
import { GetListingsQuery } from "@/lib/modules/listing/application/queries/get-listings/get-listings.query";
import { Topbar } from "@/components/ui/topbar/Topbar";
import { FilterBar } from "@/components/modules/listing/FilterBar";
import { ListingRow } from "@/components/modules/listing/ListingRow";
import styles from "./page.module.css";

interface HomePageProps {
  searchParams: Promise<{ type?: string; provincie?: string }>;
}

function buildFilters(type: string | undefined, provincie: string | undefined) {
  const filters: { propertyTypeId?: number; isStilleVerkoop?: boolean; provinceId?: number } = {};

  if (type === "bestaande-bouw") filters.propertyTypeId = 1;
  if (type === "nieuwbouw") filters.propertyTypeId = 2;
  if (type === "stille-verkoop") filters.isStilleVerkoop = true;

  return filters;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { type, provincie } = await searchParams;
  const filters = buildFilters(type, provincie);

  const [listings, provinces, allListings] = await Promise.all([
    listingContainer.getListingsHandler.execute(new GetListingsQuery(filters)),
    locationContainer.getProvincesHandler.execute(),
    listingContainer.getListingsHandler.execute(new GetListingsQuery({})),
  ]);

  return (
    <>
      <Topbar listingCount={allListings.length} />

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
              <dd className={styles.statValue}>{allListings.length}</dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Nieuwbouw</dt>
              <dd className={styles.statValue}>
                {allListings.filter((l) => l.propertyTypeId === 2).length}
              </dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Stille verkoop</dt>
              <dd className={`${styles.statValue} ${styles.statAccent}`}>
                {allListings.filter((l) => l.isStilleVerkoop).length}
              </dd>
            </div>
            <div className={styles.statCell}>
              <dt className={styles.statLabel}>Makelaars</dt>
              <dd className={styles.statValue}>
                {new Set(allListings.map((l) => l.agencyId).filter(Boolean)).size}
              </dd>
            </div>
          </dl>
        </section>

        <Suspense>
          <FilterBar provinces={provinces} totalCount={allListings.length} />
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
      </main>
    </>
  );
}
