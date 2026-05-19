import type postgres from 'postgres';
import { sql } from "@/db/client";

export interface ScrapedListing {
  sourceUrl: string;
  agencyId: number;
  street: string;
  houseNumber: string;
  cityName: string;
  price: number | null;
  livingAreaM2: number | null;
  bedrooms: number | null;
  description: string | null;
  energyLabel: string | null;
  yearBuilt: number | null;
  propertyTypeId: number;
  images: string[];
  floorPlans: string[];
}

export type UpsertOutcome = 'added' | 'updated' | 'skipped';

async function resolveCityId(cityName: string): Promise<number | null> {
  const rows = await sql<{ id: number }[]>`
    SELECT id FROM cities WHERE LOWER(name) = LOWER(${cityName}) LIMIT 1
  `;
  return rows[0]?.id ?? null;
}

function splitAddress(raw: string): { street: string; houseNumber: string } {
  const m = raw.match(/^(.+?)\s+(\d+\S*)$/);
  if (m) return { street: m[1].trim(), houseNumber: m[2].trim() };
  return { street: raw.trim(), houseNumber: '' };
}

export async function upsertListing(listing: ScrapedListing): Promise<UpsertOutcome> {
  const [cityId] = await Promise.all([resolveCityId(listing.cityName)]);

  // Wrap the entire insert+price+images in a transaction to keep them atomic.
  return sql.begin(async (tx) => {
    const existing = await tx<{ id: number; living_area_m2: number | null; description: string | null; energy_label: string | null; year_built: number | null; bedrooms: number | null }[]>`
      SELECT id, living_area_m2, description, energy_label, year_built, bedrooms
      FROM listings
      WHERE agency_id = ${listing.agencyId} AND source_url = ${listing.sourceUrl}
      LIMIT 1
    `;

    if (existing.length === 0) {
      const rows = await tx<{ id: number }[]>`
        INSERT INTO listings (
          street, house_number, city_id, agency_id, source_url,
          property_type_id, living_area_m2, bedrooms,
          description, energy_label, year_built
        ) VALUES (
          ${listing.street}, ${listing.houseNumber}, ${cityId ?? null}, ${listing.agencyId}, ${listing.sourceUrl},
          ${listing.propertyTypeId}, ${listing.livingAreaM2 ?? null}, ${listing.bedrooms ?? null},
          ${listing.description ?? null}, ${listing.energyLabel ?? null}, ${listing.yearBuilt ?? null}
        )
        RETURNING id
      `;
      const listingId = rows[0].id;
      await insertPriceAndImages(tx, listingId, listing);
      return 'added' as UpsertOutcome;
    }

    const row = existing[0];
    const changed =
      row.living_area_m2 !== listing.livingAreaM2 ||
      row.description !== listing.description ||
      row.energy_label !== listing.energyLabel ||
      row.year_built !== listing.yearBuilt ||
      row.bedrooms !== listing.bedrooms;

    if (!changed) return 'skipped' as UpsertOutcome;

    await tx`
      UPDATE listings
      SET living_area_m2 = ${listing.livingAreaM2 ?? null},
          bedrooms = ${listing.bedrooms ?? null},
          description = ${listing.description ?? null},
          energy_label = ${listing.energyLabel ?? null},
          year_built = ${listing.yearBuilt ?? null},
          updated_at = NOW()
      WHERE id = ${row.id}
    `;
    await insertPriceAndImages(tx, row.id, listing);
    return 'updated' as UpsertOutcome;
  });
}

type SqlTransaction = postgres.TransactionSql;

async function insertPriceAndImages(
  tx: SqlTransaction,
  listingId: number,
  listing: ScrapedListing,
): Promise<void> {
  if (listing.price !== null) {
    await tx`
      INSERT INTO listing_prices (listing_id, amount, price_type_id)
      VALUES (${listingId}, ${listing.price}, 1)
    `;
  }

  const allImages = [
    ...listing.images.map((url, i) => ({ url, isFloorPlan: false, sortOrder: i })),
    ...listing.floorPlans.map((url, i) => ({ url, isFloorPlan: true, sortOrder: i })),
  ];

  if (allImages.length === 0) return;

  // Bulk-insert all images in one round-trip using unnest; skip duplicates via NOT EXISTS.
  const urls = allImages.map(img => img.url);
  const sortOrders = allImages.map(img => img.sortOrder);
  const isFloorPlans = allImages.map(img => img.isFloorPlan);

  await tx`
    INSERT INTO listing_images (listing_id, url, sort_order, is_floor_plan)
    SELECT ${listingId}, v.url, v.sort_order::int, v.is_floor_plan::bool
    FROM unnest(
      ${urls}::text[],
      ${sortOrders}::int[],
      ${isFloorPlans}::bool[]
    ) AS v(url, sort_order, is_floor_plan)
    WHERE NOT EXISTS (
      SELECT 1 FROM listing_images li
      WHERE li.listing_id = ${listingId} AND li.url = v.url
    )
  `;
}

export { splitAddress };
