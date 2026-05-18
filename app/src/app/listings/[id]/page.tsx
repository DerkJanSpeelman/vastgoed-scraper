import { notFound } from "next/navigation";
import Link from "next/link";
import { listingContainer } from "@/lib/modules/listing/listing.container";
import { Topbar } from "@/components/ui/topbar/Topbar";
import { Badge } from "@/components/ui/badge/Badge";
import { EnergyLabel } from "@/components/ui/energy-label/EnergyLabel";
import { StatItem } from "@/components/ui/stat-item/StatItem";
import { ListingGallery } from "@/components/modules/listing/ListingGallery";
import { IconBack, IconLiving, IconPlot, IconBed, IconBolt, IconExt } from "@/components/modules/listing/listing-icons";
import { formatPrice, formatPriceType, formatPricePerM2, isNieuwbouw } from "@/components/modules/listing/listing-formatters";
import styles from "./page.module.css";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) notFound();

  const listing = await listingContainer.getListingByIdHandler.execute(listingId);
  if (!listing) notFound();

  const address = [listing.street, listing.houseNumber, listing.houseNumberAddition]
    .filter(Boolean).join(" ");
  const nieuwbouw = isNieuwbouw(listing.propertyTypeId);
  const pricePerM2 = formatPricePerM2(listing.currentPrice, listing.livingAreaM2);

  return (
    <>
      <Topbar />
      <main className={styles.detail}>
        <Link href="/" className={styles.back}>
          <IconBack />
          Terug naar overzicht
        </Link>

        <header className={styles.head}>
          <div>
            <p className={styles.crumbs}>
              {listing.cityName} · {listing.municipalityName} · {listing.provinceName}
            </p>
            <h1 className={styles.title}>{address}</h1>
            <div className={styles.headSub}>
              {nieuwbouw && <Badge variant="nieuwbouw" />}
              {listing.isStilleVerkoop && <Badge variant="stille-verkoop" />}
              <span className={styles.listingId}>#{listing.id}</span>
            </div>
          </div>

          <div className={styles.headRight}>
            <p className={styles.priceBig}>{formatPrice(listing.currentPrice)}</p>
            <p className={styles.priceBigSub}>{formatPriceType(listing.priceTypeId)}</p>
          </div>
        </header>

        <ListingGallery images={listing.images} address={address} />

        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <section>
              <h2 className={styles.sectionLabel}>Kenmerken</h2>
              <div className={styles.kpi}>
                <div className={styles.kpiCell}>
                  <p className={styles.kpiLabel}>Woonoppervlak</p>
                  <p className={listing.livingAreaM2 ? styles.kpiValue : `${styles.kpiValue} ${styles.kpiPlaceholder}`}>
                    {listing.livingAreaM2 ?? "—"}
                    {listing.livingAreaM2 && <span className={styles.kpiUnit}> m²</span>}
                  </p>
                </div>
                <div className={styles.kpiCell}>
                  <p className={styles.kpiLabel}>Perceeloppervlak</p>
                  <p className={listing.plotAreaM2 ? styles.kpiValue : `${styles.kpiValue} ${styles.kpiPlaceholder}`}>
                    {listing.plotAreaM2 ?? "—"}
                    {listing.plotAreaM2 && <span className={styles.kpiUnit}> m²</span>}
                  </p>
                </div>
                <div className={styles.kpiCell}>
                  <p className={styles.kpiLabel}>Slaapkamers</p>
                  <p className={listing.bedrooms ? styles.kpiValue : `${styles.kpiValue} ${styles.kpiPlaceholder}`}>
                    {listing.bedrooms ?? "—"}
                  </p>
                </div>
                <div className={styles.kpiCell}>
                  <p className={styles.kpiLabel}>Energielabel</p>
                  <p className={styles.kpiValue}>
                    <EnergyLabel label={listing.energyLabel} />
                  </p>
                </div>
              </div>
            </section>

            {listing.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionLabel}>Omschrijving</h2>
                <p className={styles.desc}>{listing.description}</p>
              </section>
            )}

            {!listing.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionLabel}>Omschrijving</h2>
                <p className={`${styles.desc} ${styles.descPlaceholder}`}>Geen omschrijving beschikbaar.</p>
              </section>
            )}
          </div>

          <aside className={styles.sideCol}>
            <div className={styles.sideBlock}>
              <h3 className={styles.sideLabel}>Details</h3>
              <dl className={styles.kv}>
                <dt className={styles.kvKey}>Prijs per m²</dt>
                <dd className={pricePerM2 === "—" ? `${styles.kvVal} ${styles.kvPlaceholder}` : styles.kvVal}>{pricePerM2}</dd>
                <dt className={styles.kvKey}>Bouwjaar</dt>
                <dd className={listing.yearBuilt ? styles.kvVal : `${styles.kvVal} ${styles.kvPlaceholder}`}>{listing.yearBuilt ?? "—"}</dd>
                <dt className={styles.kvKey}>Type</dt>
                <dd className={styles.kvVal}>{nieuwbouw ? "Nieuwbouw" : "Bestaande bouw"}</dd>
                <dt className={styles.kvKey}>Toegevoegd</dt>
                <dd className={styles.kvVal}>{new Date(listing.createdAt).toLocaleDateString("nl-NL")}</dd>
              </dl>
            </div>

            {listing.agencyName && (
              <div className={styles.sideBlock}>
                <h3 className={styles.sideLabel}>Makelaar</h3>
                <div className={styles.agencyBlock}>
                  <p className={styles.agencyName}>{listing.agencyName}</p>
                  {listing.agencyWebsiteUrl && (
                    <a
                      href={listing.agencyWebsiteUrl}
                      className={styles.agencyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                      <IconExt />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className={styles.sideBlock}>
              <h3 className={styles.sideLabel}>Bron</h3>
              <a href={listing.sourceUrl} className={styles.sourcePill} target="_blank" rel="noopener noreferrer">
                Bekijk originele advertentie
                <IconExt />
              </a>
            </div>

            {listing.prices.length > 1 && (
              <div className={styles.sideBlock}>
                <h3 className={styles.sideLabel}>Prijshistorie</h3>
                <dl className={styles.kv}>
                  {listing.prices.map((p) => (
                    <>
                      <dt key={`dt-${p.id}`} className={styles.kvKey}>
                        {new Date(p.scrapedAt).toLocaleDateString("nl-NL")}
                      </dt>
                      <dd key={`dd-${p.id}`} className={styles.kvVal}>{formatPrice(p.amount)}</dd>
                    </>
                  ))}
                </dl>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
