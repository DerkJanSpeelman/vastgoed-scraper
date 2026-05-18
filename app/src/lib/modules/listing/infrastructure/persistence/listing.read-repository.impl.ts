import { sql } from "@/db/client";
import { ListingReadRepository, ListingStats } from "../../application/queries/get-listings/get-listings.read-repository";
import { GetListingsFilters, ListingsSortBy } from "../../application/queries/get-listings/get-listings.query";
import { GetListingsRow } from "../../application/queries/get-listings/get-listings.row";
import { GetListingByIdRow } from "../../application/queries/get-listing-by-id/get-listing-by-id.row";
import { GetListingImageRow } from "../../application/queries/get-listing-by-id/get-listing-image.row";
import { GetListingPriceRow } from "../../application/queries/get-listing-by-id/get-listing-price.row";

export class ListingReadRepositoryImpl implements ListingReadRepository {
  async findAll(
    filters: GetListingsFilters,
    sortBy: ListingsSortBy,
    limit: number,
    offset: number,
  ): Promise<GetListingsRow[]> {
    const order =
      sortBy === "price-asc"  ? sql`lp_latest.amount ASC NULLS LAST` :
      sortBy === "price-desc" ? sql`lp_latest.amount DESC NULLS LAST` :
                                sql`l.created_at DESC`;

    return sql<GetListingsRow[]>`
      SELECT
        l.id,
        l.street,
        l.house_number,
        l.house_number_addition,
        ci.name           AS city_name,
        mu.name           AS municipality_name,
        pr.name           AS province_name,
        pr.code           AS province_code,
        ag.id             AS agency_id,
        ag.name           AS agency_name,
        ag.website_url    AS agency_website_url,
        COALESCE(ag.is_demo, false) AS agency_is_demo,
        l.property_type_id,
        l.is_stille_verkoop,
        l.living_area_m2,
        l.plot_area_m2,
        l.bedrooms,
        l.energy_label,
        l.year_built,
        l.created_at,
        lp_latest.amount  AS current_price,
        lp_latest.price_type_id,
        li_thumb.url      AS thumbnail_url,
        COALESCE(img_counts.total,      0) AS image_count,
        COALESCE(img_counts.floor_plans, 0) AS floor_plan_count
      FROM listings l
      JOIN cities        ci ON ci.id = l.city_id
      JOIN municipalities mu ON mu.id = ci.municipality_id
      JOIN provinces     pr ON pr.id = mu.province_id
      LEFT JOIN agencies ag ON ag.id = l.agency_id
      LEFT JOIN LATERAL (
        SELECT amount, price_type_id
        FROM listing_prices
        WHERE listing_id = l.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) lp_latest ON true
      LEFT JOIN LATERAL (
        SELECT url
        FROM listing_images
        WHERE listing_id = l.id AND is_floor_plan = false
        ORDER BY sort_order
        LIMIT 1
      ) li_thumb ON true
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)                                        AS total,
          COUNT(*) FILTER (WHERE is_floor_plan = true)   AS floor_plans
        FROM listing_images
        WHERE listing_id = l.id
      ) img_counts ON true
      ${buildWhere(filters)}
      ORDER BY ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  async findCount(filters: GetListingsFilters): Promise<number> {
    const rows = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM listings l
      JOIN cities        ci ON ci.id = l.city_id
      JOIN municipalities mu ON mu.id = ci.municipality_id
      JOIN provinces     pr ON pr.id = mu.province_id
      LEFT JOIN LATERAL (
        SELECT amount
        FROM listing_prices
        WHERE listing_id = l.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) lp_latest ON true
      ${buildWhere(filters)}
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }

  async findStats(): Promise<ListingStats> {
    const rows = await sql<{
      total: number;
      nieuwbouw: number;
      bestaande_bouw: number;
      stille_verkoop: number;
      agencies: number;
    }[]>`
      SELECT
        COUNT(*)::int                                              AS total,
        COUNT(*) FILTER (WHERE property_type_id = 2)::int         AS nieuwbouw,
        COUNT(*) FILTER (WHERE property_type_id = 1)::int         AS bestaande_bouw,
        COUNT(*) FILTER (WHERE is_stille_verkoop = true)::int     AS stille_verkoop,
        COUNT(DISTINCT agency_id)::int                            AS agencies
      FROM listings
    `;
    const row = rows[0];
    return {
      total:         row?.total         ?? 0,
      nieuwbouw:     row?.nieuwbouw     ?? 0,
      bestaandeBouw: row?.bestaande_bouw ?? 0,
      stilleVerkoop: row?.stille_verkoop ?? 0,
      agencies:      row?.agencies      ?? 0,
    };
  }

  async findById(id: number): Promise<GetListingByIdRow | null> {
    const rows = await sql<GetListingByIdRow[]>`
      SELECT
        l.id,
        l.street,
        l.house_number,
        l.house_number_addition,
        ci.name           AS city_name,
        mu.name           AS municipality_name,
        pr.name           AS province_name,
        pr.code           AS province_code,
        ag.id             AS agency_id,
        ag.name           AS agency_name,
        ag.website_url    AS agency_website_url,
        COALESCE(ag.is_demo, false) AS agency_is_demo,
        l.property_type_id,
        l.is_stille_verkoop,
        l.living_area_m2,
        l.plot_area_m2,
        l.bedrooms,
        l.energy_label,
        l.description,
        l.year_built,
        l.source_url,
        l.created_at,
        l.updated_at,
        lp_latest.amount  AS current_price,
        lp_latest.price_type_id
      FROM listings l
      JOIN cities        ci ON ci.id = l.city_id
      JOIN municipalities mu ON mu.id = ci.municipality_id
      JOIN provinces     pr ON pr.id = mu.province_id
      LEFT JOIN agencies ag ON ag.id = l.agency_id
      LEFT JOIN LATERAL (
        SELECT amount, price_type_id
        FROM listing_prices
        WHERE listing_id = l.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) lp_latest ON true
      WHERE l.id = ${id}
    `;
    return rows[0] ?? null;
  }

  async findImagesByListingId(listingId: number): Promise<GetListingImageRow[]> {
    return sql<GetListingImageRow[]>`
      SELECT id, url, sort_order, is_floor_plan
      FROM listing_images
      WHERE listing_id = ${listingId}
      ORDER BY is_floor_plan, sort_order
    `;
  }

  async findPricesByListingId(listingId: number): Promise<GetListingPriceRow[]> {
    return sql<GetListingPriceRow[]>`
      SELECT id, amount, price_type_id, scraped_at
      FROM listing_prices
      WHERE listing_id = ${listingId}
      ORDER BY scraped_at DESC
    `;
  }
}

function buildWhere(filters: GetListingsFilters) {
  const conditions: ReturnType<typeof sql>[] = [sql`WHERE 1=1`];

  // Property type filters — mutually exclusive takes precedence
  if (filters.isNieuwbouw && !filters.isBestaandeBouw) {
    conditions.push(sql`AND l.property_type_id = 2`);
  } else if (filters.isBestaandeBouw && !filters.isNieuwbouw) {
    conditions.push(sql`AND l.property_type_id = 1`);
  }

  if (filters.isStilleVerkoop !== undefined) {
    conditions.push(sql`AND l.is_stille_verkoop = ${filters.isStilleVerkoop}`);
  }

  if (filters.provinceId !== undefined) {
    conditions.push(sql`AND pr.id = ${filters.provinceId}`);
  }

  if (filters.cityIds && filters.cityIds.length > 0) {
    conditions.push(sql`AND ci.id = ANY(${filters.cityIds})`);
  }

  if (filters.municipalityIds && filters.municipalityIds.length > 0) {
    conditions.push(sql`AND mu.id = ANY(${filters.municipalityIds})`);
  }

  if (filters.minPrice !== undefined) {
    conditions.push(sql`AND lp_latest.amount >= ${filters.minPrice}`);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(sql`AND lp_latest.amount <= ${filters.maxPrice}`);
  }

  if (filters.minLivingArea !== undefined) {
    conditions.push(sql`AND l.living_area_m2 >= ${filters.minLivingArea}`);
  }

  if (filters.maxLivingArea !== undefined) {
    conditions.push(sql`AND l.living_area_m2 <= ${filters.maxLivingArea}`);
  }

  if (filters.minPlotArea !== undefined) {
    conditions.push(sql`AND l.plot_area_m2 >= ${filters.minPlotArea}`);
  }

  if (filters.maxPlotArea !== undefined) {
    conditions.push(sql`AND l.plot_area_m2 <= ${filters.maxPlotArea}`);
  }

  if (filters.energyLabels && filters.energyLabels.length > 0) {
    conditions.push(sql`AND l.energy_label = ANY(${filters.energyLabels})`);
  }

  // Join all conditions — porsager sql template tag concatenation
  return conditions.reduce((acc, cond) => sql`${acc} ${cond}`);
}
