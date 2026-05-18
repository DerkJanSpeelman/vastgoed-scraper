import { sql } from "@/db/client";
import { ListingReadRepository } from "../../application/queries/get-listings/get-listings.read-repository";
import { GetListingsFilters } from "../../application/queries/get-listings/get-listings.query";
import { GetListingsRow } from "../../application/queries/get-listings/get-listings.row";
import { GetListingByIdRow } from "../../application/queries/get-listing-by-id/get-listing-by-id.row";
import { GetListingImageRow } from "../../application/queries/get-listing-by-id/get-listing-image.row";
import { GetListingPriceRow } from "../../application/queries/get-listing-by-id/get-listing-price.row";

export class ListingReadRepositoryImpl implements ListingReadRepository {
  async findAll(
    filters: GetListingsFilters,
    limit: number,
    offset: number,
  ): Promise<GetListingsRow[]> {
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
      WHERE 1=1
        ${filters.propertyTypeId !== undefined
          ? sql`AND l.property_type_id = ${filters.propertyTypeId}`
          : sql``}
        ${filters.isStilleVerkoop !== undefined
          ? sql`AND l.is_stille_verkoop = ${filters.isStilleVerkoop}`
          : sql``}
        ${filters.provinceId !== undefined
          ? sql`AND pr.id = ${filters.provinceId}`
          : sql``}
      ORDER BY l.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
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
