"use client";

import Link from "next/link";
import Image from "next/image";
import { GetListingsDto } from "@/lib/modules/listing/application/queries/get-listings/get-listings.dto";
import { Badge } from "@/components/ui/badge/Badge";
import { EnergyLabel } from "@/components/ui/energy-label/EnergyLabel";
import { StatItem } from "@/components/ui/stat-item/StatItem";
import { IconLiving, IconPlot, IconBed, IconBolt, IconExt } from "./listing-icons";
import { formatPrice, formatPriceType, isNieuwbouw } from "./listing-formatters";
import styles from "./ListingRow.module.css";

interface ListingRowProps {
  listing: GetListingsDto;
}

export function ListingRow({ listing }: ListingRowProps) {
  const nieuwbouw = isNieuwbouw(listing.propertyTypeId);
  const address = [listing.street, listing.houseNumber, listing.houseNumberAddition]
    .filter(Boolean).join(" ");

  return (
    <article className={`${styles.row} ${listing.isStilleVerkoop ? styles.silent : ""}`}>
      <Link href={`/listings/${listing.id}`} className={styles.thumbLink} tabIndex={-1} aria-hidden>
        <div className={styles.thumb}>
          {listing.thumbnailUrl ? (
            <Image
              src={listing.thumbnailUrl}
              alt={address}
              fill
              sizes="220px"
              className={styles.thumbImg}
            />
          ) : (
            <div className={styles.thumbPlaceholder} />
          )}
          {listing.imageCount > 0 && (
            <span className={styles.thumbCount}>{listing.imageCount}</span>
          )}
          {(nieuwbouw || listing.isStilleVerkoop) && (
            <span className={styles.thumbBadge}>
              {listing.isStilleVerkoop && <Badge variant="stille-verkoop" />}
              {nieuwbouw && <Badge variant="nieuwbouw" />}
            </span>
          )}
        </div>
      </Link>

      <div className={styles.main}>
        <div className={styles.head}>
          <Link href={`/listings/${listing.id}`} className={styles.addr}>
            {address}
          </Link>
          <span className={styles.location}>
            {listing.municipalityName} · {listing.provinceName}
          </span>
        </div>

        <div className={styles.meta}>
          <StatItem icon={<IconLiving />} value={listing.livingAreaM2} unit="m²" title="Woonoppervlak" />
          <StatItem icon={<IconPlot />} value={listing.plotAreaM2} unit="m²" title="Perceeloppervlak" />
          <StatItem icon={<IconBed />} value={listing.bedrooms} title="Slaapkamers" />
          <StatItem
            icon={<IconBolt />}
            value={<EnergyLabel label={listing.energyLabel} />}
            title="Energielabel"
          />
        </div>

        <div className={styles.agency}>
          {listing.agencyName ? (
            <>
              <span>via</span>
              {listing.agencyWebsiteUrl ? (
                <a
                  href={listing.agencyWebsiteUrl}
                  className={styles.agencyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {listing.agencyName}
                  <IconExt />
                </a>
              ) : (
                <span className={styles.agencyName}>{listing.agencyName}</span>
              )}
            </>
          ) : (
            <span className={styles.agencyMissing}>Makelaar onbekend</span>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(listing.currentPrice)}</span>
          <span className={styles.priceType}>{formatPriceType(listing.priceTypeId)}</span>
        </div>
      </div>
    </article>
  );
}
